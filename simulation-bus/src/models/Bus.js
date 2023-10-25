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

  static updateBus(bus_id, object={}) {
    return this.query().findById(bus_id).patch(object);
  }

  static getBuses(select_fields = ["*"]) {
    return this.query().select(select_fields).whereNot("estado", STATES_BUS.AVAILABLE);
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
        fecha_salida: { type: "string", format: "date-time" },
        fecha_entrada: { type: "string", format: "date-time", nullable: true },
        fecha_disponible: { type: "string", format: "date-time", nullable: true },
        cupos_maximos: { type: "integer" },
        cupos_actuales: { type: "integer" },
        velocidad_promedio: { type: "integer" },
        distancia_actual: { type: "number" },
        tiempo_viaje: { type: "number" },
        fk_ruta: { type: "integer", nullable: true },
        indice_ruta: { type: "integer" },
        distancia_teorica: { type: "number" },
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
