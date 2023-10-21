//INTERFACES
import ISuscriber from "../interface/ISuscriber.js";

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
  }
}