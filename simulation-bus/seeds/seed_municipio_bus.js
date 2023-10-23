import {
  getBusesMunicipios,
} from "../src/utils/dump-data.js";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("municipio_bus").del();

  const buses_municipios = getBusesMunicipios();

  for (let i = 0; i < buses_municipios.length; i++) {
    const bus = buses_municipios[i].id_bus;
    const municipio = buses_municipios[i].id_municipio;

    await knex("municipio_bus").insert([{
      id_municipio: municipio,
      id_bus: bus,
    }]);
  }

  console.log("MunicipiosBuses insertados", buses_municipios.length);
  
}
