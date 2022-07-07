/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const { DataSource } = require('typeorm');

exports.AppDataSource = new DataSource({
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
});

exports.AppDataSource.initialize()
  .then(() => {
    console.log('connected');
  })
  .catch((err) => {
    console.log('faied', err);
  });
