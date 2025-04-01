import { config } from 'dotenv';
import path from 'path';
import sequelize from '../config/database';
import Student from '../models/Student';

// Betöltjük a teszt környezeti változókat
config({ path: path.resolve(__dirname, '../../.env.test') });

let retries = 0;
const maxRetries = 3;

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (error) {
    if (retries < maxRetries) {
      retries++;
      console.log(`Retrying database connection (attempt ${retries}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return connectToDatabase();
    }
    console.error('Test database connection error:', error);
    throw error;
  }
}

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  // Minden teszt előtt töröljük az adatokat
  await Student.destroy({ where: {}, force: true });
});

afterAll(async () => {
  try {
    // Lezárjuk az adatbázis kapcsolatot és minden függő tranzakciót
    await Promise.all([
      Student.sequelize?.close(),
      sequelize.close()
    ]);
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
}); 