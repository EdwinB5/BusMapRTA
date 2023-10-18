import { Simulation } from "./Simulation.js";
import { readFileJSON } from "../utils/dump-data.js";
import { io as client } from "socket.io-client";

export class Application {
  // class methods and properties go here
  constructor() {
    this.simulation = null;

    //Load local config simulation
    this.local_config = null;
    this.socket_client = null;
  }
  init() {
    //LOAD CONFIG APP
    this.local_config = readFileJSON("./configs/local_config.json");
    console.log("Configuracion LOCAL aplicación cargada");
    console.log(this.local_config);

    //INIT CONNECTION SOCKET
    this.socket_client = client(this.local_config.url_socket_server);

    this.socket_client.on("connect", () => {
      console.log("Conexión con el servidor socket establecida");
    });

    this.socket_client.on("disconnect", () => {
    });

    console.log("Status socket: ", this.socket_client.connected)

  }

  async run(params) {
    if (this.socket_client.connected === false) {
      throw new Error(
        `No se puede iniciar la simulación sin conexión al servidor socket. Estado socket: ${this.socket_client.connected}`
      );
    }
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
