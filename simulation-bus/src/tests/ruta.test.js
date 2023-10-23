//Lib knex to connect DB
import knex from "knex";
import knexConfig from "../../knexfile.js";

//Cheap ORM -> Objection.js
import { Model } from "objection";

//Models
import Ruta, { RUTA_PARAMS } from "../models/Ruta.js";

describe("Test Model Ruta", () => {
  beforeEach(() => {
    let db = knex(knexConfig.development);
    Model.knex(db);
  });

  test("Get Ruta origen", async () => {
    const origins = await Ruta.getMunicipio([], RUTA_PARAMS.ORIGIN);
    expect(origins).not.toBeNull();
    expect(origins.length).toBe(1); //1 origen is because the id 1 and 2 have the same origen
  });

  test("Get Ruta destino", async () => {
    const origen = await Ruta.getMunicipio(
      [],
      RUTA_PARAMS.DESTINATION,
      ["id", "nombre"]
    );
    expect(origen).not.toBeNull();
    expect(origen.length).toBe(2);
  });


  afterEach(() => {
    Model.knex().destroy();
  });
});
