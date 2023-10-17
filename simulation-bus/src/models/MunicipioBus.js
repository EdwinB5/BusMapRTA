import { Model } from 'objection';

import Municipio from './Municipio.js';
import Bus from './Bus.js';


export default class MunicipioBus extends Model {
  static get tableName() {
    return 'municipio_bus';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id_municipio', 'id_bus'],

      properties: {
        id_municipio: { type: 'integer' },
        id_bus: { type: 'integer' }
      }
    };
  }

  static get relationMappings() {
    return {
      municipio: {
        relation: Model.BelongsToOneRelation,
        modelClass: Municipio,
        join: {
          from: 'municipio_bus.id_municipio',
          to: 'municipio.id'
        }
      },
      bus: {
        relation: Model.BelongsToOneRelation,
        modelClass: Bus,
        join: {
          from: 'municipio_bus.id_bus',
          to: 'bus.id'
        }
      }
    };
  }
}
