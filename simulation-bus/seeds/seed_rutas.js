import { writeFileJSON, getRutas } from "../src/utils/dump-data.js";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries

    await knex("ruta").del();
    const rutas = await getRutas();
    let ids_rutas = [];

    for (let index = 0; index < rutas.length; index++) {
      
      const ruta_i = rutas[index];
      //console.log(ruta_i)
      await knex("ruta").insert([
        {
          id: ruta_i.id,
          municipio_origen: ruta_i.id_origen,
          municipio_destino: ruta_i.id_destino,
          distancia_total: ruta_i.distancia,
          ruta_trazada: {
            type: "LineString",
            coordinates: ruta_i.ruta_trazada,
          },
          distancias: ruta_i.distancias_array,
        },
      ]);
      ids_rutas.push({ id: ruta_i.id, id_origen: ruta_i.id_origen });
    }

    console.log("Rutas insertadas", rutas.length);

    writeFileJSON(ids_rutas, "./src/data/entity_ids/ids_rutas.json");
    knex.raw(`ALTER SEQUENCE ruta_id_seq RESTART WITH ${420}`);
}
