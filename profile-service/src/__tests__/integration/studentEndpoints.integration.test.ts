import request from 'supertest';
import express from 'express';
import { config } from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../../config/database';
import Student from '../../models/Student';
import { getAllStudents, createStudent, updateStudent, deleteStudent } from '../../controllers/studentController';
import { validateStudent } from '../../middleware/studentValidation';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Betöltjük a teszt környezeti változókat
config({ path: path.resolve(__dirname, '../../../.env.test') });

const app = express();
app.use(express.json());

// REST végpontok
app.get('/api/students', getAllStudents);
app.post('/api/students', validateStudent, createStudent);
app.put('/api/students/:id', validateStudent, updateStudent);
app.delete('/api/students/:id', deleteStudent);

describe('Student API Endpoints', () => {
  let studentId: string;

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
    jest.clearAllMocks();
  });

  describe('GET /api/students', () => {
    it('should get all students without addresses when not authenticated', async () => {
      const student = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      });

      const response = await request(app).get('/api/students');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).not.toHaveProperty('address');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should get all students with addresses when authenticated', async () => {
      const student = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      });

      const mockAddress = {
        id: uuidv4(),
        address: 'Test Street 1, Test City'
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockAddress });

      const response = await request(app)
        .get('/api/students')
        .auth('admin', 'admin123');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('address', mockAddress);
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3001/api/address', {
        headers: expect.objectContaining({
          'Authorization': expect.any(String)
        })
      });
    });

    it('should handle address service errors gracefully', async () => {
      const student = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      });

      mockedAxios.get.mockRejectedValueOnce(new Error('Address service error'));

      const response = await request(app)
        .get('/api/students')
        .auth('admin', 'admin123');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0]).not.toHaveProperty('address');
    });

    it('should return empty array when no students exist', async () => {
      const response = await request(app).get('/api/students');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      // Szimuláljuk az adatbázis hibát
      jest.spyOn(Student, 'findAll').mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/students');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');

      // Visszaállítjuk az eredeti implementációt
      jest.restoreAllMocks();
    });
  });

  describe('POST /api/students', () => {
    it('should create a new student with valid data', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          name: 'Test Student',
          email: 'test@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Student');
      expect(response.body.email).toBe('test@example.com');
      studentId = response.body.id;
    });

    it('should not create a student with invalid email', async () => {
      const response = await request(app)
        .post('/api/students')
        .send({
          name: 'Test Student',
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should not create a student with duplicate email', async () => {
      const studentData = {
        name: 'Test Student',
        email: 'test@example.com'
      };

      await Student.create(studentData);
      const response = await request(app).post('/api/students').send(studentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Az email cím már használatban van');
    });

    it('should handle database errors gracefully', async () => {
      // Szimuláljuk az adatbázis hibát
      jest.spyOn(Student, 'create').mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/students')
        .send({
          name: 'Test Student',
          email: 'test@example.com'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');

      // Visszaállítjuk az eredeti implementációt
      jest.restoreAllMocks();
    });
  });

  describe('PUT /api/students/:id', () => {
    it('should update an existing student', async () => {
      const student = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      });

      const response = await request(app)
        .put(`/api/students/${student.get('id')}`)
        .send({
          name: 'Updated Student',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Student');
      expect(response.body.email).toBe('updated@example.com');
    });

    it('should return 404 when updating non-existent student', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .put(`/api/students/${nonExistentId}`)
        .send({
          name: 'Updated Student',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Student not found');
    });

    it('should not update with invalid email', async () => {
      const student = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      });

      const response = await request(app)
        .put(`/api/students/${student.get('id')}`)
        .send({
          name: 'Updated Student',
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should handle duplicate email during update', async () => {
      const student1 = await Student.create({
        name: 'Test Student 1',
        email: 'test1@example.com'
      });

      const student2 = await Student.create({
        name: 'Test Student 2',
        email: 'test2@example.com'
      });

      const response = await request(app)
        .put(`/api/students/${student1.get('id')}`)
        .send({
          name: 'Updated Student',
          email: 'test2@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Az email cím már használatban van');
    });

    it('should handle database errors gracefully', async () => {
      const student = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      });

      // Szimuláljuk az adatbázis hibát
      jest.spyOn(Student, 'findByPk').mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .put(`/api/students/${student.get('id')}`)
        .send({
          name: 'Updated Student',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');

      // Visszaállítjuk az eredeti implementációt
      jest.restoreAllMocks();
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete an existing student', async () => {
      const student = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      });

      const response = await request(app).delete(`/api/students/${student.get('id')}`);
      expect(response.status).toBe(204);

      // Ellenőrizzük, hogy tényleg törlődött-e
      const deletedStudent = await Student.findByPk(student.get('id'));
      expect(deletedStudent).toBeNull();
    });

    it('should return 404 when deleting non-existent student', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app).delete(`/api/students/${nonExistentId}`);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Student not found');
    });

    it('should handle database errors gracefully', async () => {
      const student = await Student.create({
        name: 'Test Student',
        email: 'test@example.com'
      });

      // Szimuláljuk az adatbázis hibát
      jest.spyOn(Student, 'findByPk').mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).delete(`/api/students/${student.get('id')}`);
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');

      // Visszaállítjuk az eredeti implementációt
      jest.restoreAllMocks();
    });
  });
}); 