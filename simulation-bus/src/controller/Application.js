import { Simulation } from "./Simulation.js";
import { readFileJSON } from "../utils/dump-data.js";

export class Application {
  // class methods and properties go here
  constructor() {
    this.simulation = null;

    //Load local config simulation
    this.local_config = null;
  }
  async init() {

    //LOAD CONFIG APP
    this.local_config = await readFileJSON("./configs/local_config.json");
    console.log("Configuracion LOCAL aplicación cargada");
    console.log(local_config);

    //INIT CONNECTION SOCKET

  }

  async run(params) {

    this.simulation = new Simulation(this.local_config.time_pause);

    await this.simulation.init();
    try {
      await this.simulation.start();
    } catch (error) {
      console.log(
        `La aplicación se detuvo a petición del usuario externo, Error: ${error.message}.`
      );
    }
  }
  
}
