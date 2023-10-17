//LIBRARIES
import knex from "knex";
import knexConfig from "../../knexfile.js";
import { Model } from "objection";
import Simulacion from "../models/Simulacion.js";

import IPusblisher from "../interface/IPublisher.js";

//UTILS
import { sleep, toMS } from "../utils/Chrono.js";

const STATES_SIMULATION = {
  INIT: "iniciado",
  RUNNING: "simulando",
  PAUSE: "pausado",
  STOP: "detenido",
};

export class Simulation extends IPusblisher {
  constructor() {
    super();
    this.db = null;
    this.config_simulation = null;
    this.time_pause = 1000; //1s
  }

  async init() {
    //Init DB with knex and set DB to Model for Objection.js lib
    this.db = knex(knexConfig.development);
    Model.knex(this.db);
    //Load config simulation
    await this.setConfigSimulation();
    console.log("Configuracion de simulacion cargada");
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

      while (this.config_simulation.estado === STATES_SIMULATION.RUNNING || this.config_simulation.estado === STATES_SIMULATION.INIT) {
        this.increaseTime();
        this.notify();
        this.notifyChanges();
        await this.waitTime();
        await this.setConfigSimulation();
        console.log("Simulando...");
      }

    }
  }

  increaseTime() {
    //Aumentar tiempo de la simulacion

  }
  notifyChanges() {
    //Notificar cambios a los sockets conectados
  }

  async waitTime() {
    //Esperar tiempo de la simulacion
    let frucuency_seconds = this.config_simulation.aumento_real/this.config_simulation.multiplicador;
    await sleep(toMS(frucuency_seconds));
    console.log(`Tiempo simulado: ${frucuency_seconds} segundo`);
    //Change state simulation
  }

  async setConfigSimulation() {
    this.config_simulation = await Simulacion.query().findById(1);
  }

  /**
   * Using pattern observer, add new suscriber to list
   * @param {Object} observer
   */
  suscribe(observer) {
    this.suscribers.push(observer);
  }

  /**
   * Using pattern observer, notify to all suscribers entity changes
   */
  notify() {
    this.suscribers.forEach((suscriber) => {
      suscriber.update();
    });
  }
}
