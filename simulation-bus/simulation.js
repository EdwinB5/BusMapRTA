//Simulation
import knex from "knex";
import knexConfig from "./knexfile.js";
import { Model } from 'objection';
import Bus from "./src/models/Bus.js";

const db = knex(knexConfig.development);
Model.knex(db);

//Queries
const bus = await Bus.query().findById(1);

console.log(bus); // --> true

//console.log(bus.id); // --> 1
/*
db.raw('SELECT PostGIS_Version();').then(result => {
    console.log(result.rows);
}).catch(err => {
    console.error('Error al verificar la conexión:', err);
}).finally(() => {
    // Cerrar la conexión cuando hayas terminado
    db.destroy();
});
*/
db.destroy();