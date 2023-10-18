import { Simulation } from "./Simulation.js";
import { readFileJSON } from "../utils/dump-data.js";
import { io } from "socket.io-client";

export class Application {
  // class methods and properties go here
  constructor() {
    this.simulation = null;

    //Load local config simulation
    this.local_config = null;
    this.socket_client = null;
    this.socket_status = false;
    this.attemps = 0;
  }
  init() {
    //LOAD CONFIG APP
    this.local_config = readFileJSON("./configs/local_config.json");
    console.log("Configuracion LOCAL aplicación cargada");
    console.log(this.local_config);

    //INIT CONNECTION SOCKET
    this.socket_client = io.connect(this.local_config.url_socket_server, {
      reconnect: this.local_config.reconnection,
      reconnectionAttempts: this.local_config.reconnection_attempts,
      reconnectionDelay: this.local_config.reconnection_delay,
    });
  }

  run(params) {
    this.socket_client.on("connect", async () => {
      this.socket_status = true;
      let status_db = null;
      console.log("Socket conectado");
      //Start simulation
      this.simulation = new Simulation(this.local_config.time_pause, this.socket_client);
      
      try {
        await this.simulation.init();
        await this.simulation.start();
      } catch (error) {
        if (error.message === "read ECONNRESET" ||error.message === "El estado de la simulación no es válido, estado actual.") {
          status_db = false;
          console.log(`La aplicación se detuvo debido a un fallo en la conexión de la base de datos, Error: ${error.message}.`);
        } else if (error.message === "La simulacion esta detenida") {
          status_db = true;
          console.log(
            `La aplicación se detuvo a petición del usuario externo, Error: ${error.message}.`
          );
        }
      }
      if (!status_db) {
        this.socket_client.disconnect();
      } else if(status_db)
      {
        console.log("Para que la aplicación inicie, verifique que el estado de la simulación no es 'detenido'.");
        process.exit(1);
      }
    });

    this.socket_client.on("disconnect", (reason) => {
      console.log(`Socket desconectado: ${reason}`);
      this.simulation.db.destroy();
      console.log("Conexion con base de datos terminada");
      this.socket_status = false;
      this.attemps = 0;
    });

    this.socket_client.on("connect_error", (error) => {
      console.log(
        `Error de conexión con el socket: ${error.message}. Intento ${this.attemps}`
      );
      this.attemps++;
    });
  }
}
