import { Model } from 'objection';

export default class Simulacion extends Model {
  static get tableName() {
    return 'simulacion';
  }

  static getConfigById(id)
  {
    return this.query().findById(id);
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['multiplicador', 'maximo_viaje', 'aumento_tiempo', 'aumento_real', 'tiempo'],

      properties: {
        id: { type: 'integer' },
        multiplicador: { type: 'integer' },
        maximo_viaje: { type: 'integer' },
        aumento_tiempo: { type: 'integer' },
        aumento_real: { type: 'integer' },
        tiempo: { type: 'string', format: 'date-time' },
      }
    };
  }
}
