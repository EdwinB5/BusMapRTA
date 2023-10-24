//LIBRARIES
import knex from "knex";
import knexConfig from "../../knexfile.js";

//MODELS OBJECTION
import { Model } from "objection";
import Bus, { STATES_BUS } from "../models/Bus.js";

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
} from "../utils/Chrono.js";
import { HexFromGeometry } from "../utils/geometry.js";
import Simulacion from "../models/Simulacion.js";

export class Aparcadero extends ISuscriber {
  constructor() {
    super();

    this.buses = [];
    this.db = knex(knexConfig.development);
    Model.knex(this.db);

    this.data_actual = null;
  }
  /**
   *
   * @param {*} data with format {time_before: Date(),time_after: Date()}
   */
  async update(data) {
    //Implement
    console.log("Update >>>>>>>>>>>> Aparcadero: ", data);
    this.data_actual = data;
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

    let buses = await Bus.getBuses(); //Falta método

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
    if (this.data_actual.after_time >= bus.fecha_salida) {
      
      //Calculo de delta tiempo
      let delta_time = getDeltaTime(this.data.after_time, bus.fecha_salida);
      delta_time = toSeconds(delta_time);

      //Cambios de estado
      bus.estado = STATES_BUS.MOVING; //Actualizar en BD

      //Calcular distancia recorrida

      let distancia_recorrida = getDistance(KMHtoMS(bus.velocidad_promedio),delta_time);

      bus.distancia_actual = MtoKm(distancia_recorrida); //Actualizar en BD
      bus.tiempo_viaje;
      //Se puede optimizar si se verifica que la distancia actual sea igual a 0 para no hacer la consulta de ruta

      let ruta_bus = await Ruta.getRutaById(bus.fk_ruta);
      let ruta_trazada = HexFromGeometry(ruta_bus.ruta_trazada).coordinates;

      if (bus.distancia_actual >= ruta_bus.distancia_total) {


        let nuevo_localizacion = ruta_trazada[ruta_trazada.length - 1]; //Ultimo punto de la ruta
        bus.localizacion = nuevo_localizacion; //Actualizar en BD
        bus.fecha_entrada = bus.fecha_salida + getTime(bus.distancia_actual, bus.velocidad_promedio); //Actualizar en BD
        bus.indice_ruta = 0; //Actualizar en BD
        bus.distancia_actual = 0; //Actualizar en BD
        bus.tiempo_viaje += SecondsToHours(toSeconds(getDeltaTime(bus.fecha_salida, bus.fecha_entrada))); //Actualizar en BD

        if (bus.tiempo_viaje > Simulacion.maximo_viaje) {
          bus.estado = STATES_BUS.NOT_AVAILABLE; //Actualizar en BD
          bus.fecha_disponible = bus.fecha_entrada + bus.tiempo_viaje; //Actualizar en BD
          bus.tiempo_viaje = 0; //Actualizar en BD
        } else if(bus.tiempo_viaje <= Simulacion.maximo_viaje){
          bus.estado = STATES_BUS.AVAILABLE; //Actualizar en BD
        }

      } else {
        let distancias = ruta_bus.distancias;
        let suma_distancia_t = bus.distancia_teorica

        for (let i = bus.indice_ruta; i < distancias.length; i++) {
          const distancia_i = distancias[i];
          suma_distancia_t += distancia_i;

          if (suma_distancia_t > bus.distancia_actual) {
            //Se cambia al punto anterior
            bus.indice_ruta = i;
            let nuevo_localizacion = ruta_trazada[bus.indice_ruta]; //Posible cambio
            bus.localizacion = nuevo_localizacion; //Actualizar en BD
            break;
          } else if (suma_distancia_t == bus.distancia_actual) {
            //Se cambia al siguiente punto
            bus.indice_ruta = i + 1
            let nuevo_localizacion = ruta_trazada[bus.indice_ruta]; //Posible cambio
            bus.localizacion = nuevo_localizacion; //Actualizar en BD
            break;
          }
        }
      }
    } else {
      console.log(`El bus ${bus.id} no ha salido aun`);
    }
  }
  manageMOVING(bus) {}
  manageAVAILABLE(bus) {}
  manageNOT_AVAILABLE(bus) {}
}
