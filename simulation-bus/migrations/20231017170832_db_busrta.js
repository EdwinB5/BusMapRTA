/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
const up = function (knex) {
  return knex.schema
    .createTable("municipio", function (table) {
      table.increments("id").primary();
      table.string("nombre", 50).notNullable();
      table.specificType("localizacion", "geometry(POINT)");
      table.specificType("extension", "geometry(MULTIPOLYGON)").notNullable();
      table.boolean("tiene_aparcadero").notNullable();
      table.integer("capacidad_maxima");
      table.integer("capacidad_actual");
      table.integer("buses_no_disponibles");
      table.integer("buses_disponibles");
    })
    .createTable("bus", function (table) {
      table.increments("id").primary();
      table.specificType("localizacion", "geometry(POINT)").notNullable();
      table.string("estado", 25).notNullable();
      table.integer("origen").unsigned();
      table.foreign("origen").references("municipio.id");
      table.integer("destino").unsigned();
      table.foreign("destino").references("municipio.id");
      table.datetime("fecha_salida");
      table.datetime("fecha_entrada");
      table.datetime("duracion_aparcadero");
      table.datetime("fecha_disponible");
      table.integer("cupos_maximos");
      table.integer("cupos_actuales");
    })
    .createTable("simulacion", function (table) {
      table.increments("id").primary();
      table.integer("multiplicador").notNullable();
      table.integer("maximo_viaje").notNullable();
      table.integer("aumento_tiempo").notNullable();
      table.integer("aumento_real").notNullable();
      table.datetime("tiempo").notNullable();
      table.string("estado", 25).notNullable();
    })
    .createTable("municipio_bus", function (table) {
      table.integer("id_municipio").unsigned();
      table.integer("id_bus").unsigned();
      table.foreign("id_municipio").references("municipio.id");
      table.foreign("id_bus").references("bus.id");
    });
};

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
const down = function (knex) {
  return knex.schema
    .table("municipio_bus", function (table) {
      table.dropForeign("id_municipio");
      table.dropForeign("id_bus");
    })
    .table("bus", function (table) {
      table.dropForeign("origen");
      table.dropForeign("destino");
    })
    .dropTableIfExists("simulacion")
    .dropTableIfExists("municipio_bus")
    .dropTableIfExists("bus")
    .dropTableIfExists("municipio");
};

const config = {
  transaction: false,
};

export { config, up, down };
