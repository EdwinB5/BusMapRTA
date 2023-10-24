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
    console.log("Update >>>>>>>>>>>> Aparcadero: ", data);
    this.data = data;
    await this.processChange(data.before_time, data.after_time);
  }

  async processChange(time_before, time_after) {
    //Get Municipios where tiene_parada = true
    //Por cada Municipio obtener los buses where bus.estado = "en_ruta" | "en_parada"
    /**
     * Bus
     * 1. estado
     * 2. localizacion
     * 3. fecha_entrada
     * 4. tiempo_viaje
     * 5. indice ruta
     * 6. fecha_disponible
     * 7. distancia_actual
     *
     * Datos a cambiar
     * Municipio
     * 1. capacidad_actual
     * 2. buses_not_available
     * 3. buses_available
     *
     */

    let buses = await Bus.getBuses();

    for (let i = 0; i < buses.length; i++) {
      const bus = buses[i];
      switch (bus.estado) {
        case STATES_BUS.PARKED:
          this.managePARKED(bus);
          break;
        case STATES_BUS.MOVING:
          this.manageMOVING(bus);
          break;
        case STATES_BUS.AVAILABLE:
          this.manageAVAILABLE(bus);
          break;
        case STATES_BUS.NOT_AVAILABLE:
          this.manageNOT_AVAILABLE(bus);
          break;
      }
    }
  }

  async managePARKED(bus) {
    if (this.data.after_time >= bus.fecha_salida) {
      //Calculo de delta tiempo
      let delta_time = getDeltaTime(bus.fecha_salida, this.data.after_time);
      delta_time = toSeconds(delta_time);

      //Calcular distancia recorrida

      let distancia_recorrida = getDistance(
        KMHtoMS(bus.velocidad_promedio),
        delta_time
      );

      let distancia_actual = MtoKm(distancia_recorrida); //Actualizar en BD
      
      //Se puede optimizar si se verifica que la distancia actual sea igual a 0 para no hacer la consulta de ruta
      let ruta_bus = await Ruta.getRutaById(bus.fk_ruta);
      let ruta_trazada = HexFromGeometry(ruta_bus.ruta_trazada).coordinates;

      //CAMBIO DE ESTADO A MOVING
      console.log("bus: ", bus.id, STATES_BUS.MOVING, distancia_actual);

      bus = await Bus.updateBus(bus.id, {
        estado: STATES_BUS.MOVING,
        distancia_actual: distancia_actual,
      });
      console.log("bus", bus)
      //DISMINUIR CAPACIDAD EN SU MUNICIPIO ORIGEN
      Municipio.updateCapacities(ruta_bus.municipio_origen);

      //QUITAR RELACION DE BUS CON SU ORIGEN
      /* AQUI =>*/ await MunicipioBus.deleteMunicipioBus(
        ruta_bus.municipio_origen,
        bus.id
      ); //Actualizar en BD

      //SE VERIFICA SI LLEGO AL FINAL DE LA RUTA O DESTINO
      if (bus.distancia_actual >= ruta_bus.distancia_total) {
        //Establecimiento del origen cuando llega al fin
        let nuevo_localizacion = ruta_trazada[ruta_trazada.length - 1]; //Ultimo punto de la ruta

        bus = await Bus.updateBus(bus.id, {
          localizacion: { type: "Point", coordinates: nuevo_localizacion },
        });

        //CAMBIAR RELACION DE BUS CON SU NUEVO ORIGEN POR MEDIO DEL DESTINO
        // AQUI =>
        let id_municipio_origen = ruta_bus.municipio_destino;
        await MunicipioBus.insertMunicipioBus(id_municipio_origen, bus.id); //Actualizar en BD

        //ACTUALIZACIÓN DE FECHA DE ENTRADA
        let fecha_entrada = new Date(bus.fecha_salida);
        fecha_entrada.setHours( fecha_entrada.getHours() + getTime(bus.distancia_actual, bus.velocidad_promedio));
        //REINICIO DE VARIABLES

        //SE ASIGNA EL TIEMPO DE VIAJE QUE LLEVA DICHO BUS
        let tiempo_viaje =
          SecondsToHours(
            toSeconds(
              getDeltaTime(bus.fecha_salida, fecha_entrada.toISOString())
            )
          ) + bus.tiempo_viaje;
        
        bus = await Bus.updateBus(bus.id, {
          fecha_entrada: fecha_entrada.toISOString(),
          indice_ruta: 0,
          distancia_actual: 0,
          distancia_teorica: 0,
          tiempo_viaje: tiempo_viaje,
        });

        //SE VERIFICA SI EL TIEMPO DE VIAJE ES MAYOR AL MAXIMO DE VIAJE
        if (bus.tiempo_viaje > Simulation.maximo_viaje) {
          let estado = STATES_BUS.NOT_AVAILABLE;

          let fecha_disponible = new Date(bus.fecha_entrada);
          fecha_disponible.setHours(fecha_disponible.getHours() + bus.tiempo_viaje);

          bus = await Bus.update(bus.id, {
            estado: estado,
            fecha_disponible: fecha_disponible.toISOString(),
            tiempo_viaje: 0,
          });

          await Municipio.updateCapacities(
            MODE.INCREMENT,
            id_municipio_origen,
            STATES_BUS.NOT_AVAILABLE
          );
        } else if (bus.tiempo_viaje <= Simulacion.maximo_viaje) {

          let estado = STATES_BUS.AVAILABLE; //Actualizar en BD

          bus = await Bus.update(bus.id, {
            estado: estado,
          });

          await Municipio.updateCapacities(
            MODE.INCREMENT,
            id_municipio_origen,
            STATES_BUS.AVAILABLE
          );

        }
      } else {
        // EN ESTE PUNTO SE VA A MOVER EL BUS
        let distancias = ruta_bus.distancias;
        let suma_distancia_t = bus.distancia_teorica;

        //SE RECORRE CADA DISTANCIA Y SE SUMA TEMPORALMENTE

        for (let i = bus.indice_ruta; i < distancias.length; i++) {
          const distancia_i = distancias[i];
          suma_distancia_t += distancia_i;

          //EL BUS NO RECORRIO LA SUFICIENTE DISTANCIA PARA LLEGAR AL SIGUIENTE PUNTO
          if (suma_distancia_t > bus.distancia_actual) {
            //SE CAMBIA EL INDICE DE RUTA
            let indice_ruta = i
            //CAMBIO DE LOCALIZACION PUNTO ANTERIOR
            let nuevo_localizacion = ruta_trazada[indice_ruta];

            bus = await Bus.updateBus(bus.id, {
              localizacion: { type: "Point", coordinates: nuevo_localizacion }, 
              indice_ruta: indice_ruta
            });
            
            break;
            
          } else if (suma_distancia_t == bus.distancia_actual) { //EL BUS RECORRIO LA DISTANCIA EXACTA PARA LLEGAR AL SIGUIENTE PUNTO
        
            //SE CAMBIA EL INDICE DE RUTA
            let indice_ruta = i + 1;

            //CAMBIO DE LOCALIZACION PUNTO EXACTO
            let nuevo_localizacion = ruta_trazada[indice_ruta]; //Cambio de localización

            bus = await Bus.updateBus(bus.id, {
              localizacion: { type: "Point", coordinates: nuevo_localizacion },
              indice_ruta: indice_ruta
            });

            break;
          }
        }
        //SE ITERA EN LAS DISTANCIAS
        await Bus.updateBus(bus.id, {distancia_teorica: suma_distancia_t});
        
      }
    } else {
      console.log(`El bus ${bus.id} no ha salido aun`);
    }
  }
  manageMOVING(bus) {}
  manageAVAILABLE(bus) {}
  manageNOT_AVAILABLE(bus) {}
}
