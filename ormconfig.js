/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const { DataSource } = require('typeorm');

exports.AppDataSource = new DataSource({
  type: 'postgres',
  port: +process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cs_messaging',
  host: process.env.DB_HOST || 'localhost',
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName:
    process.env.DB_MIGRATION_TABLE || 'cs_messaging_migration_table',
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
