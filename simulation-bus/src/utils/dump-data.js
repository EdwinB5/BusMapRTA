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
  const path_municipios_aparcaderos = "./src/data/municipios_aparcaderos.json";
  const path_limites_cundimarca = "./src/data/limites_cundinamarca.json";

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
