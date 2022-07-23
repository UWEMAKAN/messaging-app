/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const { DataSource } = require('typeorm');

const getConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return {
      url: databaseUrl,
      type: 'postgres',
      ssl: {
        rejectUnauthorized: false,
      },
      entities: ['src/entities/*.entity.ts'],
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
      logging: true,
      migrationsTableName: process.env.DB_MIGRATION_TABLE,
      name: 'appConn',
    };
  }
  return {
    type: 'postgres',
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    entities: ['src/entities/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: process.env.DB_MIGRATION_TABLE,
    logging: false,
    synchronize: false,
    name: 'appConn',
  };
};

const config = getConfig();

exports.AppDataSource = new DataSource(config);

exports.AppDataSource.initialize()
  .then(() => {
    console.log('connected');
  })
  .catch((err) => {
    console.log('faied', err);
  });
