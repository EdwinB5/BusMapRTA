import exp from "constants";
import fs from "fs";

const file_path_in = "../data/limites_colombia.json";
const file_path_out = "../data/limites_cundinamarca.json";
let data_municipios = {
  /*
  NombreMunicipio: {
    extension: {},
  },
*/
};

function getPolygonByName(target_names) {
  let geo_json_data = readFileJSON(file_path_in);

  target_names.forEach(function (name) {
    geo_json_data["features"].forEach(function (feature) {
      if (feature.properties.NAME_1 === name) {
        const nombre_municipio = feature.properties.NAME_2;
        const extension_municipio = feature.geometry.coordinates;
        data_municipios[nombre_municipio] = { extension: extension_municipio };
      }
    });
  });

  writeFileJSON(data_municipios, file_path_out);
}

//getPolygonByName(['Cundinamarca', 'BogotáD.C.']);

export function readFileJSON(path) {
  let json_in;
  try {
    const data_in = fs.readFileSync(path, "utf-8");
    json_in = JSON.parse(data_in);
  } catch (error) {
    throw new Error(`Error reading or parsing the file: ${error} | PATH: ${path}`);
  }
  return json_in;
}

export function writeFileJSON(data, path) {
  try {
    let data_out = JSON.stringify(data);
    fs.writeFileSync(path, data_out);
  } catch (error) {
    throw new Error(`Error stringify or writefile: ${error} | PATH: ${path}`);
  }
}

export function mergeMunicipios() {
  const path_municipios_aparcaderos = "../data/municipios_aparcaderos.json";
  const path_limites_cundimarca = "../data/limites_cundinamarca.json";

  let municipios = readFileJSON(path_municipios_aparcaderos); //municipios_aparcaderos
  let limites_cundinamarca = readFileJSON(path_limites_cundimarca); //limites_cundinamarca

  let merge_municipios = [];

  for (const key in limites_cundinamarca) {
    let municipio = {};
    let municipio_aparcadero = municipios[key];

    if (municipio_aparcadero != undefined) {
      municipio.nombre = key;
      municipio.extension = limites_cundinamarca[key].extension;
      municipio.localizacion = municipio_aparcadero.localizacion;
      municipio.capacidad_maxima = municipios[key].capacidad_maxima;
      municipio.es_aparcadero = true;
    } else
    {
      municipio.nombre = key;
      municipio.extension = limites_cundinamarca[key].extension;
      municipio.localizacion = null
      municipio.capacidad_maxima = null;
      municipio.es_aparcadero = false;
    }

    merge_municipios.push(municipio);
  }
  
  let result = {
    municipios_aparcaderos: merge_municipios,
  };

  writeFileJSON(result, "./src/data/municipios_aparcaderos_full.json");
}

export function getMunicipios() {
  const municipios = readFileJSON("./src/data/municipios_aparcaderos_full.json");
  return municipios.municipios_aparcaderos;
}

export function getBuses()
{
  const buses = readFileJSON("./src/data/entity_ids/buses.json");
  return buses;
}

export function getBusesMunicipios() {
  const buses_municipios = readFileJSON("./src/data/entity_ids/ids_buses.json");
  return buses_municipios;
}

export function randINT(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
} 

export async function getRutas() {
  
  try {
    const rutas_file = readFileJSON("./src/data/entity_ids/rutas.json");
    return rutas_file;
  } catch (error) {
    return await generateRutas();
  }
}

export async function generateRutas() {
  const municipios = readFileJSON("./src/data/entity_ids/ids_municipios.json");
  let rutas = [];
  let buses = {};

  let id_ruta = 1;
  for (let i = 0; i < municipios.length; i++) {
    for (let j = 0; j < municipios.length; j++) {
      const municipio_j = municipios[j];
      const municipio_i = municipios[i];

      if (municipio_i.id != municipio_j.id) {
        let loc_origen = municipio_i.localizacion;
        let loc_destino = municipio_j.localizacion;
        let result = await consumeRutasOSMR(loc_origen, loc_destino);

        let ruta = {
          id: id_ruta,
          id_origen: municipio_i.id,
          id_destino: municipio_j.id,
          distancia: result.distancia_total,
          ruta_trazada: result.ruta_trazada,
          distancias_array: result.distancias,
        };

        rutas.push(ruta);
        buses[municipio_i.nombre] = {
          fk_ruta: id_ruta,
          localizacion: municipio_i.localizacion,
          id_municipio: municipio_i.id,
        };
        id_ruta++;
      }
    }
  }
  writeFileJSON(rutas, "./src/data/entity_ids/rutas.json");
  writeFileJSON(buses, "./src/data/entity_ids/buses.json");

  return rutas;
}


export async function consumeRutasOSMR(loc_a, loc_b) {

  let lon_a = loc_a[1];
  let lat_a = loc_a[0];
  let lon_b = loc_b[1];
  let lat_b = loc_b[0];

  let api = `https://router.project-osrm.org/route/v1/driving/${lon_a},${lat_a};${lon_b},${lat_b}?overview=full&geometries=geojson&annotations=distance`;
  let response = await fetch(api, {
      method: "GET",
    });
  let data = await response.json();

  let result = {
    distancia_total: data.routes[0].distance,
    ruta_trazada: data.routes[0].geometry.coordinates,
    distancias: data.routes[0].legs[0].annotation.distance,
  };
  console.log("Ruta consultada", loc_a);
  return result;
}