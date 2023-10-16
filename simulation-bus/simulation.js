//Simulation
import knex from "knex";
import knexConfig from "./knexfile";

const db = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: process.env.PG_USER, // Variable de entorno para el usuario
    password: process.env.PG_PASSWORD, // Variable de entorno para la contraseña
    database: process.env.PG_DATABASE, // Variable de entorno para la base de datos
  },
});

// Resto del código para interactuar con la base de datos

// No olvides cerrar la conexión cuando hayas terminado.
db.destroy();
