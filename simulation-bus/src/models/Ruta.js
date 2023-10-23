//OBJECTION
import { Model } from "objection";

import Municipio from "./Municipio.js";

export const RUTA_PARAMS = {
    ORIGIN: "origen",
    DESTINATION: "destino",
};

export default class Ruta extends Model {
  static get tableName() {
    return "ruta";
  }
  /**
   * @param {*} ids_ruta array with ids of ruta. By default empty array, with 
   * @param {*} RUTA RUTA_PARAMS.ORIGIN or RUTA_PARAMS.DESTINATION. By default RUTA_PARAMS.ORIGIN
   * @param {*} select_fields fields to select. By default all fields are selected
   * @returns array with municipios from ruta
   */
  static getMunicipio(
    ids_ruta = [],
    RUTA = RUTA_PARAMS.ORIGIN,
    select_fields = ["*"]
  ) {
    return this.relatedQuery(RUTA).for(ids_ruta).select(select_fields);
  }
  static get relationMappings() {
    return {
      origen: {
        relation: Model.BelongsToOneRelation,
        modelClass: Municipio,
        join: {
          from: "ruta.municipio_origen",
          to: "municipio.id",
        },
      },
      destino: {
        relation: Model.BelongsToOneRelation,
        modelClass: Municipio,
        join: {
          from: "ruta.municipio_destino",
          to: "municipio.id",
        },
      },
    };
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        /* "municipio_origen",
        "municipio_destino",
        "distancia_total",
        "destino",
        "cupos_maximos",
        "cupos_actuales", */
      ],
      properties: {
        id: { type: "integer" },
        origen: { type: "integer" },
        destino: { type: "integer" },
        distancia_total: { type: "float" },
        distancias: { type: "float[]" },
        ruta_trazada: { type: "object" },
      },
    };
  }
}
