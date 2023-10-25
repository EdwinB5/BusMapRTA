import {
  getMunicipios,
  writeFileJSON,
} from "../src/utils/dump-data.js";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("municipio_bus").del();
  await knex("bus").del();
  await knex("ruta").del();
  await knex("municipio").del();
  await knex("simulacion").del();

  //mergeMunicipios();
  const municipios = getMunicipios();
  let ids_municipios = [];
  let id_g = 1;
  for (let i = 0; i < municipios.length; i++) {
    const municipio = municipios[i];
    
    if (municipio.es_aparcadero) {
      await knex("municipio").insert([
        {
          id: id_g,
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
          id: id_g,
          nombre: municipio.nombre,
          extension: { type: "MultiPolygon", coordinates: municipio.extension },
          localizacion: { type: "Point", coordinates: [0,0] },
          tiene_aparcadero: municipio.es_aparcadero,
          capacidad_actual: 0,
          buses_no_disponibles: 0,
          buses_disponibles: 0,
        },
      ]);
    }

    if (municipio.es_aparcadero) {
      ids_municipios.push({
        id: id_g,
        nombre: municipio.nombre,
        localizacion: municipio.localizacion,
      });
    }
    id_g++;
  }

  writeFileJSON(ids_municipios, "./src/data/entity_ids/ids_municipios.json");

  console.log(`Municipios insertados: ${id_g}`);

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

  console.log("Simulacion insertada");

  knex.raw("ALTER SEQUENCE municipio_id_seq RESTART WITH 117");
}
