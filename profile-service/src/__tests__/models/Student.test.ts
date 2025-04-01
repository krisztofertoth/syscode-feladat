import Student from '../../models/Student';
import { UniqueConstraintError } from 'sequelize';
import sequelize from '../../config/database';
import { config } from 'dotenv';
import path from 'path';

// Betöltjük a teszt környezeti változókat
config({ path: path.resolve(__dirname, '../../../.env.test') });

describe('Student Model', () => {
  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: true });
    } catch (error) {
      console.error('Test database connection error:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Student.destroy({ where: {}, force: true });
  });

  it('should create a student with valid data', async () => {
    const studentData = {
      name: 'Test Student',
      email: 'test@example.com'
    };

    const student = await Student.create(studentData);

    expect(student).toBeDefined();
    expect(student.id).toBeDefined();
    expect(student.name).toBe(studentData.name);
    expect(student.email).toBe(studentData.email);
  });

  it('should not create a student with invalid email', async () => {
    const studentData = {
      name: 'Test Student',
      email: 'invalid-email'
    };

    await expect(Student.create(studentData)).rejects.toThrow();
  });

  it('should not create a student with duplicate email', async () => {
    const studentData = {
      name: 'Test Student',
      email: 'test2@example.com'
    };

    await Student.create(studentData);
    await expect(Student.create(studentData)).rejects.toThrow(UniqueConstraintError);
  });
}); 