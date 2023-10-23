//Lib knex to connect DB
import knex from "knex";
import knexConfig from "../../knexfile.js";

//Cheap ORM -> Objection.js
import { Model } from "objection";

//Models
import Municipio from "../models/Municipio.js";

//let db = null;

describe("Municipio Model", () => {
  beforeEach(() => {
    let db = knex(knexConfig.development);
    Model.knex(db);
  });

  test("Get Municipios with aparcadero", async () => {
    const municipios = await Municipio.getByAparcaderoStatus(true);
    //console.log("municipios: ", municipios);
    expect(municipios).not.toBeNull();
    expect(municipios.length).toBe(21);
  });

  test("Get Municipios with aparcadero and all buses relation", async () => {
    const municipios = await Municipio.getByAparcaderoStatus(true);
    expect(municipios.length).toBe(21);

    for (let i = 0; i < municipios.length; i++) {
        const municipio = municipios[i];
        //console.log(municipio);
        let buses = await municipio.$relatedQuery('buses');
        console.log(`Id municipio: ${municipio.id} y ${buses}`)
        //expect(buses.length).toBe(1);
    }

  }, 50000);

  test("Get Municipios with aparcadero and all buses relation using method STATIC relatedQuery", 
  async () =>{
    const municipios = await Municipio.getByAparcaderoStatus(true);
    const buses = await Municipio.relatedQuery('buses').for(municipios);
    for (let i = 0; i < buses.length; i++) {
        const bus = buses[i];
        expect(bus.length).toBe(0);
    }
  });

  afterEach(() => {
    Model.knex().destroy();
  });
});
