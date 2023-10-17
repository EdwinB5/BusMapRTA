import { Model } from 'objection';

import Municipio from './Municipio.js';


export default class Bus extends Model {
  static get tableName() {
    return 'bus';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['localizacion', 'estado', 'origen', 'destino', 'cupos_maximos', 'cupos_actuales'],

      properties: {
        id: { type: 'integer' },
        localizacion: { type: 'object' },
        estado: { type: 'string', maxLength: 25 },
        origen: { type: 'integer' },
        destino: { type: 'integer' },
        fecha_salida: { type: 'datetime' },
        fecha_entrada: { type: 'datetime' },
        duracion_aparcadero: { type: 'datetime' },
        fecha_disponible: { type: 'datetime' },
        cupos_maximos: { type: 'integer' },
        cupos_actuales: { type: 'integer' }
      }
    };
  }

  static get relationMappings() {
    

    return {
      origen: {
        relation: Model.BelongsToOneRelation,
        modelClass: Municipio,
        join: {
          from: 'bus.origen',
          to: 'municipio.id'
        }
      },
      destino: {
        relation: Model.BelongsToOneRelation,
        modelClass: Municipio,
        join: {
          from: 'bus.destino',
          to: 'municipio.id'
        }
      }
    };
  }
}
