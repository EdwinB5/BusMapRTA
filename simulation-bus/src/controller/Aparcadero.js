//LIBRARIES
import knex from "knex";
import knexConfig from "../../knexfile.js";

//MODELS OBJECTION
import { Model } from "objection";
import Bus, { STATES_BUS } from "../models/Bus.js";
import MunicipioBus from "../models/MunicipioBus.js";
import Municipio, { MODE } from "../models/Municipio.js";
import Simulacion from "../models/Simulacion.js";

//CONTROLLER
import { Simulation } from "./Simulation.js";

import Ruta from "../models/Ruta.js";

//INTERFACES
import ISuscriber from "../interface/ISuscriber.js";

//UTILS
import {
  toMS,
  getDeltaTime,
  toSeconds,
  KMHtoMS,
  MtoKm,
  getTime,
  SecondsToHours,
  getDistance,
  KmToM,
} from "../utils/Chrono.js";
import { HexFromGeometry } from "../utils/geometry.js";


export class Aparcadero extends ISuscriber {
  constructor() {
    super();

    this.buses = [];
    this.db = knex(knexConfig.development);
    Model.knex(this.db);

    this.data = null;
  }
  /**
   *
   * @param {*} data with format {time_before: Date(),time_after: Date()}
   */
  async update(data) {
    //Implement
    console.log('Update >>>>>>>>>>>> Aparcadero: ', data);
    const trx = await Model.startTransaction();
    this.data = data;
    try {
      await this.processChange();
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      console.log(error);
    }
  }

  async processChange() {
    let buses = await Bus.getBuses();

    for (let i = 0; i < buses.length; i++) {
      const trx_bus = await Model.startTransaction();
      const bus = buses[i];

      try {
        switch (bus.estado) {
          case STATES_BUS.PARKED:
            await this.managePARKED(bus);
            break;
          case STATES_BUS.MOVING:
            await this.manageMOVING(bus);
            break;
          case STATES_BUS.AVAILABLE:
            this.manageAVAILABLE(bus);
            break;
          case STATES_BUS.NOT_AVAILABLE:
            await this.manageNOT_AVAILABLE(bus);
            break;
        }
        await trx_bus.commit();
      } catch (error) {
        await trx_bus.rollback();
        console.log(error);
      }
    }
    await this.db.destroy();
  }

  async managePARKED(bus) {
    //console.log("bus: ", bus.id, bus.estado);
    if (this.data.after_time >= bus.fecha_salida) {
      let delta_time = toSeconds(getDeltaTime(bus.fecha_salida, this.data.after_time));
      let distancia_recorrida = getDistance(KMHtoMS(bus.velocidad_promedio), delta_time);
      let distancia_actual = MtoKm(distancia_recorrida);

      let ruta_bus = await Ruta.getRutaById(bus.fk_ruta);
      let ruta_trazada = HexFromGeometry(ruta_bus.ruta_trazada).coordinates;

      let estado_bus = STATES_BUS.MOVING;
      //BUS
      await Bus.updateBus(bus.id, { estado: estado_bus, distancia_actual: distancia_actual });

      //CAPACIDADES MUNICIPIO
      const trx_tempo = await Model.startTransaction();
      try {
        await Municipio.updateCapacities(MODE.DECREMENT, ruta_bus.municipio_origen, 'capacidad_actual', 1);
        trx_tempo.commit();
      } catch (error) {
        trx_tempo.rollback();
      }

      await MunicipioBus.deleteMunicipioBus(ruta_bus.municipio_origen, bus.id);

      //console.log(`distancia_actual ${KmToM(distancia_actual)} | Total: ${ruta_bus.distancia_total} | Distancia teorica ${bus.distancia_teorica}`);

      if (this.llegoDestino(KmToM(distancia_actual), ruta_bus.distancia_total) && estado_bus == STATES_BUS.MOVING) {
        console.log(`Llego a destino ${bus.id}`);
        this.establecerAparcadero(bus, distancia_actual, ruta_bus, ruta_trazada);
      } else {
        this.calculoMovimiento(bus, ruta_bus, KmToM(distancia_actual), ruta_trazada);
      }
    }
  }

  async manageMOVING(bus) {
    let delta_time = toSeconds(getDeltaTime(bus.fecha_salida, this.data.after_time));
    let distancia_recorrida = getDistance(KMHtoMS(bus.velocidad_promedio), delta_time);
    let distancia_actual = MtoKm(distancia_recorrida);

    let ruta_bus = await Ruta.getRutaById(bus.fk_ruta);
    let ruta_trazada = HexFromGeometry(ruta_bus.ruta_trazada).coordinates;
    /**
     * //BUS
    await Bus.updateBus(bus.id, { estado: STATES_BUS.PARKED, distancia_actual: distancia_actual });

    //CAPACIDADES MUNICIPIO
    await Municipio.updateCapacities(MODE.DECREMENT, ruta_bus.municipio_origen, 'capacidad_actual', 1);
    await MunicipioBus.deleteMunicipioBus(ruta_bus.municipio_origen, bus.id);
     */

    //console.log(`distancia_actual ${KmToM(distancia_actual)} | Total: ${ruta_bus.distancia_total} | Distancia teorica ${bus.distancia_teorica}`);

    if (this.llegoDestino(KmToM(distancia_actual), ruta_bus.distancia_total)) {
      console.log(`Llego a destino ${bus.id}`);
      this.establecerAparcadero(bus, distancia_actual, ruta_bus, ruta_trazada);
    } else {
      this.calculoMovimiento(bus, ruta_bus, KmToM(distancia_actual), ruta_trazada);
    }
  }

  async manageNOT_AVAILABLE(bus) {
    if (this.data.after_time >= bus.fecha_disponible) {
      let estado = STATES_BUS.AVAILABLE;

      let municipio_bus = await MunicipioBus.getMunicipioBusByBusId(bus.id);
      let id_municipio = municipio_bus[0].id_municipio;

      await Bus.updateBus(bus.id, {
        estado: estado,
        tiempo_viaje: 0,
        fecha_entrada: null,
        fecha_disponible: null,
        distancia_actual: 0,
        cupos_actuales: 0,
        fk_ruta: null,
        distancia_teorica: 0,
      });

      await Municipio.updateCapacities(MODE.INCREMENT, id_municipio, 'buses_disponibles', 1);
      await Municipio.updateCapacities(MODE.DECREMENT, id_municipio, 'buses_no_disponibles', 1);
    }
  }

  manageAVAILABLE(bus) {}

  llegoDestino(distancia_actual, distancia_total) {
    return distancia_actual >= distancia_total;
  }
  //Cambia la localización del bus
  async calculoMovimiento(bus, ruta_bus, distancia_actual, ruta_trazada) {
    let distancias = ruta_bus.distancias;
    let suma_distancia_t = bus.distancia_teorica;

    //onsole.log(`Bus id ${bus.id} | Ruta: ${distancias.length}`);

    for (let i = bus.indice_ruta; i < distancias.length; i++) {
      const distancia_i = distancias[i];
      suma_distancia_t += distancia_i;

      if (this.distanciaPuntoAtras(suma_distancia_t, distancia_actual)) {
        //console.log('Punto atras');
        let indice_ruta = i;
        let nuevo_localizacion = ruta_trazada[indice_ruta];
        let loc = [nuevo_localizacion[1], nuevo_localizacion[0]]; //[1] Lat [0] Long
        //console.log(`localización anterior ${HexFromGeometry(bus.localizacion).coordinates}, nueva localizacion ${loc}`);
        suma_distancia_t -= distancia_i;
        await Bus.updateBus(bus.id, { localizacion: { type: 'Point', coordinates: loc }, indice_ruta: indice_ruta, distancia_teorica: suma_distancia_t });
        break;
      } else if (this.distanciaPuntoExacto(suma_distancia_t, distancia_actual)) {
        //console.log('Punto exacto');
        let indice_ruta = i + 1;
        let nuevo_localizacion = ruta_trazada[indice_ruta];
        let loc = [nuevo_localizacion[1], nuevo_localizacion[0]];
        await Bus.updateBus(bus.id, { localizacion: { type: 'Point', coordinates: loc }, indice_ruta: indice_ruta, distancia_teorica: suma_distancia_t });
        break;
      }
    }
  }

  distanciaPuntoAtras(suma_distancia_t, distancia_actual) {
    return suma_distancia_t > distancia_actual;
  }

  distanciaPuntoExacto(suma_distancia_t, distancia_actual) {
    return suma_distancia_t == distancia_actual;
  }

  async establecerAparcadero(bus, distancia_actual, ruta_bus, ruta_trazada) {
    //Establecimiento del origen cuando llega al fin
    let nuevo_localizacion = ruta_trazada[ruta_trazada.length - 1]; //Ultimo punto de la ruta
    let loc = [nuevo_localizacion[1], nuevo_localizacion[0]];
    //CAMBIAR RELACION DE BUS CON SU NUEVO ORIGEN POR MEDIO DEL DESTINO
    // AQUI =>
    let id_municipio_origen = ruta_bus.municipio_destino;

    //ACTUALIZACIÓN DE FECHA DE ENTRADA
    let fecha_entrada = new Date(bus.fecha_salida);
    fecha_entrada.setHours(fecha_entrada.getHours() + getTime(distancia_actual, bus.velocidad_promedio));
    //REINICIO DE VARIABLES

    let delta_nw = getDeltaTime(bus.fecha_salida, fecha_entrada);
    delta_nw = toSeconds(delta_nw);
    delta_nw = SecondsToHours(delta_nw);
    //SE ASIGNA EL TIEMPO DE VIAJE QUE LLEVA DICHO BUS
    let tiempo_viaje = delta_nw + bus.tiempo_viaje;

    await Bus.updateBus(bus.id, { localizacion: { type: 'Point', coordinates: loc }, fecha_entrada: fecha_entrada.toISOString(), indice_ruta: 0, distancia_actual: 0, distancia_teorica: 0, tiempo_viaje: tiempo_viaje });
    console.log(`Bus id ${bus.id} Nuevo origen!`);

    let relaciones = await MunicipioBus.getMunicipioBusByBusId(bus.id).length;
    console.log('##################################################################Relaciones: ', relaciones);
    if (relaciones == undefined || relaciones == 0) {
      await MunicipioBus.insertMunicipioBus(id_municipio_origen, bus.id); //Actualizar en BD
    }

    //SE VERIFICA SI EL TIEMPO DE VIAJE ES MAYOR AL MAXIMO DE VIAJE
    if (tiempo_viaje > Simulation.maximo_viaje) {
      let estado = STATES_BUS.NOT_AVAILABLE;

      let fecha_disponible = new Date(bus.fecha_entrada);
      fecha_disponible.setHours(fecha_disponible.getHours() + bus.tiempo_viaje);

      await Bus.updateBus(bus.id, { estado: estado, fecha_disponible: fecha_disponible.toISOString(), tiempo_viaje: 0 });

      await Municipio.updateCapacities(MODE.INCREMENT, id_municipio_origen, 'buses_no_disponibles', 1);
    } else if (tiempo_viaje <= Simulacion.maximo_viaje) {
      let estado = STATES_BUS.AVAILABLE; //Actualizar en BD
      await Bus.updateBus(bus.id, { estado: estado });
      await Municipio.updateCapacities(MODE.INCREMENT, id_municipio_origen, 'buses_disponibles', 1);
    }
  }
}

