import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Ha teszt környezetben vagyunk, betöltjük a teszt konfigurációt
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });
} else {
  dotenv.config();
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'student_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
    port: parseInt(process.env.DB_PORT || '5432')
  }
);

export default sequelize; 