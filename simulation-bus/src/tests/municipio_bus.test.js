//Lib knex to connect DB
import knex from "knex";
import knexConfig from "../../knexfile.js";

//Cheap ORM -> Objection.js
import { Model } from "objection";

//MODEL

import MunicipioBus from "../models/MunicipioBus.js";

describe("Municipio Bus", () => {
  beforeEach(() => {
    let db = knex(knexConfig.development);
    Model.knex(db);
  });
  test("Delete municipio_bus", async () => {
    const municipio_bus = await MunicipioBus.deleteMunicipioBus(18, 1);
    expect(municipio_bus).not.toBeNull();
    expect(municipio_bus).toBe(1);
  });


  test("Insert municipio_bus", async () => {
    const municipio_bus = await MunicipioBus.insertMunicipioBus(18, 1);
    expect(municipio_bus).not.toBeNull();
    expect(municipio_bus.id_municipio).toBe(18);
    expect(municipio_bus.id_bus).toBe(1);
  })

  afterEach(() => {
    Model.knex().destroy();
  });
});
