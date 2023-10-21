//Controllers
import { Simulation } from "./Simulation.js";
import { Aparcadero } from "./Aparcadero.js";
//Utils
import { readFileJSON } from "../utils/dump-data.js";

//Libs
import { io } from "socket.io-client";

let APPLICATION = null;

export class Application {
  // class methods and properties go here
  constructor() {
    if (APPLICATION !== null) {
      throw new Error(
        "No se puede instanciar la clase Application, usa el método getInstance() ."
      );
    }
  }
  /**
   * @returns {Application} a unique aplication instance same for all 
   * @static
   * */
  static getInstance()
  {
    if(APPLICATION === null)
    {
      this.simulation = null;
      this.local_config = null;
      this.socket_client = null;
      this.socket_status = false;
      this.attemps = 0;
      APPLICATION = new Application();
    }
    return APPLICATION;
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
      console.info("Socket conectado");
      
      //Start simulation
      this.simulation = new Simulation(this.local_config.time_pause);
      this.aparcadero = new Aparcadero();
      this.simulation.subscribe(this.aparcadero);

      try {
        await this.simulation.init();
        await this.simulation.start();
      } catch (error) {
        if (error.message === "read ECONNRESET" ||error.message === "El estado de la simulación no es válido, estado actual.") {
          status_db = false;
          console.error(`La aplicación se detuvo debido a un fallo en la conexión de la base de datos, Error: ${error.message}.`);
        } else if (error.message === "La simulacion esta detenida") {
          status_db = true;
          console.error(
            `La aplicación se detuvo a petición del usuario externo, Error: ${error.message}.`
          );
        }
      }
      if(status_db)
      {
        console.info("Para que la aplicación inicie, verifique que el estado de la simulación no es 'detenido'.");
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
