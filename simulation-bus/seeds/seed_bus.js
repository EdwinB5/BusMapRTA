import {
  getBuses,
  getBusesMunicipios,
  randINT,
  writeFileJSON,
} from "../src/utils/dump-data.js";
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("municipio_bus").del();
  await knex("bus").del();

  let ids_buses = [];

  const buses = getBuses();

  let id_bus = 1;

  for (const key in buses) {
    const bus = buses[key];

    let cupos_max = randINT(20, 40);
    let cupos_act = randINT(1, cupos_max);

    await knex("bus").insert([
      {
        id: id_bus,
        localizacion: { type: "Point", coordinates: bus.localizacion },
        estado: "aparcado",
        fecha_salida: "0001-01-01 00:00:00",
        cupos_maximos: cupos_max,
        cupos_actuales: cupos_act,
        velocidad_promedio: randINT(60, 80),
        distancia_actual: 0,
        tiempo_viaje: 0,
        fk_ruta: bus.fk_ruta,
        indice_ruta: 0,
        distancia_teorica: 0,
      },
    ]);

    ids_buses.push({
      id_bus: id_bus,
      fk_ruta: bus.fk_ruta,
      id_municipio: bus.id_municipio,
    });
    id_bus++;
  }

  console.log("Buses insertados", (id_bus - 1));

  writeFileJSON(ids_buses, "./src/data/entity_ids/ids_buses.json");
  
  knex.raw(`ALTER SEQUENCE bus_id_seq RESTART WITH ${21}`);
}
