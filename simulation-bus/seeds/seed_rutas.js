import { getRutas } from "../src/utils/dump-data.js";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("ruta").del();

  
  let x = 0;
  const rutas = getRutas();

  for (let index = 0; index < rutas.length; index++) {
    const ruta_i = rutas[index];
    await knex("ruta")
      .insert([
        {
          id: index + 1,
          municipio_origen: ruta_i.id_origen,
          municipio_destino: ruta_i.id_destino,
          distancia_total: ruta_i.distancia,
          ruta_trazada: {
            type: "LineString",
            coordinates: ruta_i.ruta.coordinates,
          },
          distancias: ruta_i.distancias,
        },
      ])
    x++;
  }

  console.log(`Se insertaron ${x} rutas`);
}
