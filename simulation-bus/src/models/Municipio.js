import { Model } from "objection";
import Bus from "./Bus.js";

import { Simulation } from "../controller/Simulation.js";

export const MODE = {
    "DECREMENT": "decrement",
    "INCREMENT": "increment"
  }

export default class Municipio extends Model {
  static get tableName() {
    return "municipio";
  }
  static getByAparcaderoStatus(status, select_fields = ["*"]) {
     
    return this.query().
    select(select_fields)
    .where("tiene_aparcadero", status);
  }

  static updateMunicipio(municipio_id, object = {}) {
    return this.query().findById(municipio_id).patch(object)
  }
  
  static updateCapacities(mode, id_municipio, column, value=1) 
  {
    if (mode == MODE.DECREMENT) {
      console.log(`Decrementado => Municipio: ${id_municipio} #request ${Simulation.getSimulationsRequest()} => ${column} | -${value}`);
      return this.query().findById(id_municipio).decrement(column, value);
    } else
    {
      console.log(`Incrementando => Municipio: ${id_municipio} #request ${Simulation.getSimulationsRequest()} => ${column} | +${value}`);
      return this.query().findById(id_municipio).increment(column, value);
    }
  }

  static get relationMappings () {
    return {
      buses: {
        relation: Model.ManyToManyRelation,
        modelClass: Bus,
        join: {
          from: 'municipio.id',
          through: {
            from: 'municipio_bus.id_municipio',
            to: 'municipio_bus.id_bus',
          },
          to: 'bus.id',
        },
      },
    };
  };

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "nombre",
        "localizacion",
        "extension",
        "capacidad_maxima",
        "capacidad_actual",
        "buses_no_disponibles",
        "buses_disponibles",
      ],

      properties: {
        id: { type: "integer" },
        nombre: { type: "string", maxLength: 50 },
        localizacion: { type: "object" },
        extension: { type: "object" },
        capacidad_maxima: { type: "integer" },
        capacidad_actual: { type: "integer" },
        buses_no_disponibles: { type: "integer" },
        buses_disponibles: { type: "integer" },
        tiene_aparcadero: { type: "boolean" },
      },
    };
  }
}
