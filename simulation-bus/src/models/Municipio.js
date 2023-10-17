import { Model } from 'objection';

export default class Municipio extends Model {
  static get tableName() {
    return 'municipio';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nombre', 'localizacion', 'extension', 'capacidad_maxima', 'capacidad_actual', 'buses_no_disponibles', 'buses_disponibles'],

      properties: {
        id: { type: 'integer' },
        nombre: { type: 'string', maxLength: 50 },
        localizacion: { type: 'object' },
        extension: { type: 'object' },
        capacidad_maxima: { type: 'integer' },
        capacidad_actual: { type: 'integer' },
        buses_no_disponibles: { type: 'integer' },
        buses_disponibles: { type: 'integer' }
      }
    };
  }
}
