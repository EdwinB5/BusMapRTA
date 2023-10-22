//INTERFACES
import ISuscriber from "../interface/ISuscriber.js";

export const STATES_BUS = {
  PARKED: "aparcado",
  MOVING: "en_movimiento",
  NOT_AVAILABLE: "no_disponible",
  AVAILABLE: "disponible"
};

export class Aparcadero extends ISuscriber {
  constructor() {
    super();
    this.name = "aparcadero";
    this.buses = [];
  }
  /**
   *
   * @param {*} data with format {time_before: Date(),time_after: Date()}
   */
  update(data) {
    //Implement
    console.log("Update >>>>>>>>>>>> Aparcadero: ", data);


    //Calculo Delta Time

    //delta_time = this.calculateDeltaTime(data.time_before, data.time_after);
    
    //Get Municipios where tiene_parada = true
    //Por cada Municipio obtener los buses where bus.estado = "en_ruta" | "en_parada"
  }
}