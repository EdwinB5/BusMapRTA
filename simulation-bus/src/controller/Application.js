import { Simulation } from "./Simulation.js";
export class Application {

    // class methods and properties go here
    constructor() 
    {
        this.simulation = null;

    }
    async run(params) {
        this.simulation = new Simulation();
        await this.simulation.init();
        await this.simulation.start();
    }
}
