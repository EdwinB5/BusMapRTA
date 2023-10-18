//Simulation
/*
import knex from "knex";
import knexConfig from "./knexfile.js";
import { Model, QueryBuilder } from 'objection';
import Municipio from "./src/models/Municipio.js";

const db = knex(knexConfig.development);
Model.knex(db);

//Queries
const municipio = await Municipio.query().where({ tiene_aparcadero: true })

console.log(municipio); // --> true

db.destroy();
*/

import { Application } from "./src/controller/Application.js";

function main(params) {
    const app = new Application();
    app.run(params);
}

main();