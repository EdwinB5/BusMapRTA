/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries

  await knex('table_name').del()

  await knex('municipio').insert([
    {
      nombre: 'Bogotá',
      localizacion: { type: 'Point', coordinates: [-74.0721, 4.7110] },
      extension: { type: 'Polygon', coordinates: [[[/* Coordenadas del polígono para Bogotá */]]] },
      capacidad_maxima: 30,
      capacidad_actual: 15,
      buses_no_disponibles: 1,
      buses_disponibles: 3,
    }
  ]);

  await knex('simulacion').insert([
    {id: 1, multiplicador: 1, maximo_viaje: 8, aumento_tiempo: 1, aumento_real: 1, tiempo: '0000-00-00 00:00:00'},
  ]);
};
