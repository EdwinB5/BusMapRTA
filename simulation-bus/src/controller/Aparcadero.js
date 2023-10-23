//LIBRARIES
import knex from "knex";
import knexConfig from "../../knexfile.js";

//MODELS OBJECTION
import { Model } from "objection";
import Municipio from "../models/Municipio.js";

//INTERFACES
import ISuscriber from "../interface/ISuscriber.js";

//UTILS
import { getDeltaTime, toSeconds, KMHtoMS } from "../utils/Chrono.js";

export const STATES_BUS = {
  PARKED: "aparcado",
  MOVING: "en_movimiento",
  NOT_AVAILABLE: "no_disponible",
  AVAILABLE: "disponible",
};

export class Aparcadero extends ISuscriber {
  constructor() {
    super();

    this.buses = [];
    this.db = knex(knexConfig.development);
    Model.knex(this.db);
  }
  /**
   *
   * @param {*} data with format {time_before: Date(),time_after: Date()}
   */
  async update(data) {
    //Implement
    console.log("Update >>>>>>>>>>>> Aparcadero: ", data);
    await this.processChange(data.before_time, data.after_time);
  }

  async processChange(time_before, time_after) {
    {
      let delta_time = getDeltaTime(time_before, time_after);

      delta_time = toSeconds(delta_time); //Calculo Delta Time
      let municipios = await Municipio.getByAparcaderoStatus(true, "");
      console.log("DTime", delta_time);

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
    }
  }
}
