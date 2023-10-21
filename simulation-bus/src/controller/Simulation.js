//LIBRARIES
import knex from "knex";
import knexConfig from "../../knexfile.js";

//MODELS OBJECTION
import { Model } from "objection";
import Simulacion from "../models/Simulacion.js";

//INTERFACES
import IPusblisher from "../interface/IPublisher.js";
import { Application } from "./Application.js";

//UTILS
import { sleep, toMS } from "../utils/Chrono.js";


const STATES_SIMULATION = {
  INIT: "iniciado",
  RUNNING: "simulando",
  PAUSE: "pausado",
  STOP: "detenido",
};

export class Simulation extends IPusblisher {
  constructor(time_pause) {
    super();
    this.db = null;
    this.config_simulation = null;
    this.time_pause = time_pause; //1s
    this.before_time = null;
    this.after_time = null;
  }

  async init() {
    //Init DB with knex and set DB to Model for Objection.js lib
    this.db = knex(knexConfig.development);
    Model.knex(this.db);
    //Load remote config simulation
    await this.setConfigSimulation();
    console.log("Configuracion REMOTA de simulacion cargada");
    console.log(this.config_simulation);
  }

  async start() {
    while (true) {
      if (this.config_simulation.estado === STATES_SIMULATION.STOP) {
        this.db.destroy();
        throw new Error("La simulacion esta detenida");
      }

      while (this.config_simulation.estado === STATES_SIMULATION.PAUSE) {
        await sleep(this.time_pause);
        await this.setConfigSimulation();
        console.log("En Pausa...");
      }

      while (
        this.config_simulation.estado === STATES_SIMULATION.RUNNING ||
        this.config_simulation.estado === STATES_SIMULATION.INIT
      ) {
        await this.increaseTime();
        this.notify();
        this.notifyChanges();
        await this.waitTime();
        await this.setConfigSimulation();
        console.log("Simulando...");
      }
    }
  }

  async increaseTime() {
    //Aumentar tiempo de la simulacion
    let actual_time = this.config_simulation.tiempo;
    this.before_time = new Date(actual_time);
    console.log("Tiempo simulación: "+ actual_time);

    let time_add = this.config_simulation.aumento_tiempo; //In seconds
    actual_time.setSeconds(actual_time.getSeconds() + time_add); //Change time
    this.after_time = new Date(actual_time);
    //Update time in DB
    let state = await Simulacion.query().findById(1).patch({
      tiempo: actual_time.toISOString(),
    });

    console.log("Siguiente: " + state);
  }

  /**
   * Notify to all sockets connected changes made in simulation
   */
  notifyChanges() {
    //Notificar cambios a los sockets conectados
    const message_i = {
      message: `changes made successfully. Time before: ${this.before_time} | Time after: ${this.after_time}`,
    };
    Application.getInstance().socket_client.emit("change", message_i);
  }

  async waitTime() {
    //Esperar tiempo de la simulacion
    let frucuency_seconds =
      this.config_simulation.aumento_real /
      this.config_simulation.multiplicador;
    await sleep(toMS(frucuency_seconds));
    console.log(`Tiempo simulado: ${frucuency_seconds} segundo`);
    //Change state simulation
  }

  async setConfigSimulation() {
    this.config_simulation = await Simulacion.query().findById(1);
    this.checkStatusSimulation(this.config_simulation.estado);
  }

  /**
   * Allow check if status simulation is valid, if not, throw error. Possible states: **iniciado**, **simulando**, **pausado**, **detenido**
   * @param {*} status_remote 
   * @returns 
   */
  checkStatusSimulation(status_remote) {
    console.log("Estado simulación: ", status_remote)
    let status_simulation_valid = false;
    for (const key in STATES_SIMULATION) {
      const status =  STATES_SIMULATION[key];
      if (status === status_remote) {
        status_simulation_valid = true;
        break;
      }
    }
    
    if (!status_simulation_valid) {
      
      throw new Error(
        `El estado de la simulación no es válido, estado actual.`
      );
    }
  }
  /**
   * Using pattern observer, add new suscriber to list
   * @param {Object} observer
   */
  subscribe(observer) {
    this.suscribers.push(observer);
  }

  /**
   * Using pattern observer, notify to all suscribers entity changes
   */
  notify() {
    let data = { before_time: this.before_time, after_time: this.after_time };
    this.suscribers.forEach((suscriber) => {
      suscriber.update(data);
    });
  }
}
