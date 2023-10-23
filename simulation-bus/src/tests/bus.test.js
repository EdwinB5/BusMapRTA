//Lib knex to connect DB
import knex from "knex";
import knexConfig from "../../knexfile.js";

//Cheap ORM -> Objection.js
import { Model } from "objection";

//Models
import Bus from "../models/Bus.js";

//let db = null;

describe("Bus Model", () => {
  beforeEach(() => {
    let db = knex(knexConfig.development);
    Model.knex(db);
  });

  test("Get Buses aparcado status", async () => {
    const buses = await Bus.getBusbyStatus("aparcado");
    expect(buses).not.toBeNull();
    expect(buses.length).toBe(23);
  });

  test("Get Buses with related ruta", async() => {
    const buses = await Bus.getBusbyStatus("aparcado", ["id", "fk_ruta"]);
    expect(buses.length).toBe(23);

    for (let i = 0; i < buses.length; i++) {
      const bus = buses[i];
      let bus_ruta = await Bus.relatedQuery("ruta").for(bus.id);
      expect(bus_ruta.length).toBe(1);
    }
  });

//   test("Get  with aparcadero and all buses relation", async () => {
//     const buses = await buses.getByAparcaderoStatus(true, "id");
//     expect(buses.length).toBe(23);

//     for (let i = 0; i < buses.length; i++) {
//       const bus = buses[i];
//       let buses_municipio = await municipio.$relatedQuery("buses");
//       expect(buses.length).toBeGreaterThanOrEqual(0);
//     }

//   }, 50000);

//   test("Get Municipios with aparcadero and all buses relation using method STATIC relatedQuery", 
//   async () =>{
//     const municipios = await Municipio.getByAparcaderoStatus(true, "id");
//     expect(municipios.length).toBe(21);

//     let ids = [];
//     municipios.forEach((element) => {
//       ids.push(element.id);
//     });
//     console.log(ids);

//     const buses = await Municipio.relatedQuery("buses").for(ids);
//     expect(buses.length).toBeGreaterThanOrEqual(0);

//   });

  afterEach(() => {
    Model.knex().destroy();
  });
});
