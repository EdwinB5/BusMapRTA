//Simulation
import knex from "knex";
import knexConfig from "./knexfile.js";

const db = knex(knexConfig.development);
db.raw('SELECT PostGIS_Version();').then(result => {
    console.log(result.rows);
}).catch(err => {
    console.error('Error al verificar la conexión:', err);
}).finally(() => {
    // Cerrar la conexión cuando hayas terminado
    db.destroy();
});