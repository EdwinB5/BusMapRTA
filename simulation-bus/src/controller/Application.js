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
        try {
            await this.simulation.start();
        } catch (error) {
            console.log(`La aplicación se detuvo a petición del usuario externo, Error: ${error.message}.`);
            
        }
    }
}
