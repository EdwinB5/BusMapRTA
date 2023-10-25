/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const knexConfig = {
  development: {
    client: process.env.BM_CLIENT,
    connection: {
      host: process.env.BM_HOST,
      port: process.env.BM_PORT,
      database: process.env.BM_DB,
      user: process.env.BM_USER,
      password: process.env.BM_PASSWORD,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    },
    pool: {
      min: 0,   // Número mínimo de conexiones en el pool
      max: 100,  // Número máximo de conexiones en el pool
    },
  },

  staging: {
    client: process.env.BM_CLIENT,
    connection: {
      host: process.env.BM_HOST,
      database: process.env.BM_DB,
      user: process.env.BM_USER,
      password: process.env.BM_PASSWORD,
    },
    pool: {
      min: 0,
      max: 100,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: process.env.BM_CLIENT,
    connection: {
      host: process.env.BM_HOST,
      database: process.env.BM_DB,
      user: process.env.BM_USER,
      password: process.env.BM_PASSWORD,
    },
    pool: {
      min: 0,
      max: 100,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
};

export default knexConfig;
