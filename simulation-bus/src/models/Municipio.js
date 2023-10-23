import { Model } from "objection";
import Bus from "./Bus.js";
export default class Municipio extends Model {
  static get tableName() {
    return "municipio";
  }
  static getByAparcaderoStatus(status, select_fields = "*") {
     
    return this.query().
    select(select_fields)
    .where("tiene_aparcadero", status);
  }
  static get relationMappings () {
    return {
      buses: {
        relation: Model.ManyToManyRelation,
        modelClass: Bus,
        join: {
          from: "municipio.id",
          through: {
            from: "municipio_bus.id_municipio",
            to: "municipio_bus.id_bus",
          },
          to: "bus.id",
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
