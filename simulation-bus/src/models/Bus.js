import { Model } from 'objection';
import Ruta from './Ruta.js';

export const STATES_BUS = {
  PARKED: 'aparcado',
  MOVING: 'en_movimiento',
  NOT_AVAILABLE: 'no_disponible',
  AVAILABLE: 'disponible'
}

export default class Bus extends Model {
  static get tableName() {
    return "bus";
  }

  static getBusbyStatus(status, select_fields = "*") {
    return this.query().select(select_fields).where("estado", status);
  }

  static getBuses(select_fields = ["*"]) {
    return this.query().select(select_fields).whereNot("estado", STATES_BUS.NOT_AVAILABLE);
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: [
        "localizacion",
        "estado",
        "origen",
        "destino",
        "cupos_maximos",
        "cupos_actuales",
      ],

      properties: {
        id: { type: "integer" },
        localizacion: { type: "object" },
        estado: { type: "string", maxLength: 25 },
        fecha_salida: { type: "datetime" },
        fecha_entrada: { type: "datetime" },
        fecha_disponible: { type: "datetime" },
        cupos_maximos: { type: "integer" },
        cupos_actuales: { type: "integer" },
        velocidad_promedio: { type: "integer" },
        distancia_actual: { type: "float" },
        tiempo_viaje: { type: "float" },
        fk_ruta: { type: "integer" },
        indice_ruta: { type: "integer" },
      },
    };
  }

  static get relationMappings() {
    return {
      ruta: {
        relation: Model.BelongsToOneRelation,
        modelClass: Ruta,
        join: {
          from: "bus.fk_ruta",
          to: "ruta.id",
        },
      },
    };
  }
}
