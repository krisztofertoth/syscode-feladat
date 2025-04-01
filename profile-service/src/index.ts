import express, { Request, Response } from 'express';
import sequelize from './config/database';
import { getAllStudents, createStudent, updateStudent, deleteStudent } from './controllers/studentController';
import { validateStudent } from './middleware/studentValidation';
import logger from './config/logger';

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(express.json());


// CORS middleware
app.use(cors({
    origin: 'http://localhost:4200', // Engedélyezett frontend cím
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Fejléc engedélyezése
    credentials: true,
}));

// REST végpontok
app.get('/api/students', getAllStudents);
app.post('/api/students', validateStudent, createStudent);
app.put('/api/students/:id', validateStudent, updateStudent);
app.delete('/api/students/:id', deleteStudent);

// Adatbázis kapcsolat és szerver indítás
sequelize.sync()
    .then(() => {
        logger.info('Adatbázis kapcsolat létrejött');
        app.listen(PORT, () => {
            logger.info(`Szerver fut a következő porton: ${PORT}`);
        });
    })
    .catch((err: Error) => {
        logger.error('Adatbázis kapcsolódási hiba:', { error: err });
    });
