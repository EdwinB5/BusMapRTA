//Lib knex to connect DB
import knex from "knex";
import knexConfig from "../../knexfile.js";

//WKX
import wkx from "wkx";

//Cheap ORM -> Objection.js
import { Model } from "objection";

//Models
import Ruta, { RUTA_PARAMS } from "../models/Ruta.js";



describe("Test Model Ruta", () => {
  beforeEach(() => {
    let db = knex(knexConfig.development);
    Model.knex(db);
  });

  test("Get municipio origen from ruta", async () => {
    const origins = await Ruta.getMunicipio([1, 2], RUTA_PARAMS.ORIGIN);
    expect(origins).not.toBeNull();
    expect(origins.length).toBe(1); //1 origen is because the id 1 and 2 have the same origen
  });

  test("Get municipio destino from ruta", async () => {
    const origen = await Ruta.getMunicipio([1, 45], RUTA_PARAMS.DESTINATION, [
      "id",
      "nombre",
    ]);
    expect(origen).not.toBeNull();
    expect(origen.length).toBe(2);
  });

  test("Get ruta by id", async () => {

    const ruta = await Ruta.getRutaById(1);
    console.log(ruta);
    //console.log(ruta);
    let ruta_trazada = wkx.Geometry.parse(Buffer.from(ruta.ruta_trazada, "hex"));
    console.log(ruta_trazada.toGeoJSON().coordinates); 

    expect(ruta).not.toBeNull();
    expect(ruta.id).toBe(1);

  });

  afterEach(() => {
    Model.knex().destroy();
  });
});
