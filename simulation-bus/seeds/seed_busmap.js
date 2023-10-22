import { mergeMunicipios, getMunicipios } from "../src/utils/dump-data.js";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("municipio").del();
  await knex("ruta").del();
  await knex("simulacion").del();

  mergeMunicipios();
  const municipios = getMunicipios();
  municipios.forEach(async function (municipio) {
    if (municipio.es_aparcadero) {
      await knex("municipio").insert([
        {
          nombre: municipio.nombre,
          localizacion: { type: "Point", coordinates: municipio.localizacion },
          extension: { type: "MultiPolygon", coordinates: municipio.extension },
          tiene_aparcadero: municipio.es_aparcadero,
          capacidad_maxima: municipio.capacidad_maxima,
          capacidad_actual: 0,
          buses_no_disponibles: 0,
          buses_disponibles: 0,
        },
      ]);
    } else {
      await knex("municipio").insert([
        {
          nombre: municipio.nombre,
          extension: { type: "MultiPolygon", coordinates: municipio.extension },
          tiene_aparcadero: municipio.es_aparcadero,
          capacidad_actual: 0,
          buses_no_disponibles: 0,
          buses_disponibles: 0,
        },
      ]);
    }
  });
  await knex("simulacion").insert([
    {
      id: 1,
      multiplicador: 1,
      maximo_viaje: 8,
      aumento_tiempo: 1,
      aumento_real: 1,
      tiempo: "0001-01-01 00:00:00",
      estado: "iniciado",
    },
  ]);
}
