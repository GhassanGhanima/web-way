import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { config } from 'dotenv';
import { join } from 'path';

// Register tsconfig-paths to resolve path aliases
import * as tsConfigPaths from 'tsconfig-paths';
const baseUrl = join(__dirname, '../..');
tsConfigPaths.register({
  baseUrl,
  paths: {
    '@app/*': ['src/*'],
  },
});

config();
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Test@1234',
  database: process.env.DB_DATABASE || 'web-way',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
