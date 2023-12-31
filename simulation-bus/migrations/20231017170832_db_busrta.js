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
    .createTable("ruta", function (table) {
      table.increments("id").primary();
      table.integer("municipio_origen").unsigned();
      table.foreign("municipio_origen").references("municipio.id");
      table.integer("municipio_destino").unsigned();
      table.foreign("municipio_destino").references("municipio.id");
      table.float("distancia_total");
      table.specificType("ruta_trazada", "geometry(LINESTRING)");
      table.specificType("distancias", "float[]");
    })
    .createTable("bus", function (table) {
      table.increments("id").primary();
      table.specificType("localizacion", "geometry(POINT)").notNullable();
      table.string("estado", 25).notNullable();
      table.datetime("fecha_salida");
      table.datetime("fecha_entrada");
      table.datetime("fecha_disponible");
      table.integer("cupos_maximos");
      table.integer("cupos_actuales");
      table.integer("velocidad_promedio").notNullable();
      table.float("distancia_actual").defaultTo(0);
      table.float("tiempo_viaje").defaultTo(0);
      table.integer("fk_ruta").unsigned();

      table.foreign("fk_ruta").references("ruta.id");

      table.integer("indice_ruta").defaultTo(0);
      table.float("distancia_teorica").defaultTo(0);
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
      table.dropForeign("fk_ruta");
    })
    .table("ruta", function (table) {
      table.dropForeign("municipio_origen");
      table.dropForeign("municipio_destino");
    })
    .dropTableIfExists("simulacion")
    .dropTableIfExists("municipio_bus")
    .dropTableIfExists("ruta")
    .dropTableIfExists("bus")
    .dropTableIfExists("municipio");
    
};

const config = {
  transaction: false,
};

export { config, up, down };
