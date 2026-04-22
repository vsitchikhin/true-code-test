import * as path from 'path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';


dotenv.config({ path: path.join(__dirname, '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, 'src/**/*.orm-entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'src/infrastructure/persistence/migrations/*{.ts,.js}')],
});
