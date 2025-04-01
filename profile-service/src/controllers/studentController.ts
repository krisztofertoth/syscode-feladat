import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Student from '../models/Student';
import logger from '../config/logger';
import axios from 'axios';

const ADDRESS_SERVICE_URL = process.env.ADDRESS_SERVICE_URL || 'http://localhost:3001';

// Listázás
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const students = await Student.findAll();
        logger.info('Összes diák lekérdezve', { count: students.length });

        // Ha autentikált a kérés, lekérjük a címeket is
        if (req.headers.authorization) {
            try {
                const addressResponse = await axios.get(`${ADDRESS_SERVICE_URL}/api/address`, {
                    headers: {
                        'Authorization': req.headers.authorization
                    }
                });
                
                // Minden diákhoz hozzáadjuk a címet
                const studentsWithAddresses = students.map(student => ({
                    ...student.toJSON(),
                    address: addressResponse.data
                }));
                
                res.json(studentsWithAddresses);
            } catch (error) {
                // Ha nem sikerül lekérni a címet, csak a diákokat küldjük
                logger.warn('Nem sikerült lekérni a címet', { error });
                res.json(students);
            }
        } else {
            // Ha nincs autentikáció, csak a diákokat küldjük
            res.json(students);
        }
    } catch (error) {
        logger.error('Hiba a diákok lekérdezése során', { error });
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Új felvitel
export const createStudent = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const student = await Student.create(req.body);
        logger.info('Új diák létrehozva', { studentId: student.id });
        res.status(201).json(student);
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            logger.warn('Duplikált email cím', { email: req.body.email });
            res.status(400).json({ message: 'Az email cím már használatban van' });
        } else {
            logger.error('Hiba a diák létrehozása során', { error });
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Módosítás
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            logger.warn('Nem létező diák frissítési kísérlet', { studentId: req.params.id });
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        await student.update(req.body);
        logger.info('Diák frissítve', { studentId: student.id });
        res.json(student);
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            logger.warn('Duplikált email cím frissítés során', { email: req.body.email });
            res.status(400).json({ message: 'Az email cím már használatban van' });
        } else {
            logger.error('Hiba a diák frissítése során', { error, studentId: req.params.id });
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Törlés
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            logger.warn('Nem létező diák törlési kísérlet', { studentId: req.params.id });
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        await student.destroy();
        logger.info('Diák törölve', { studentId: req.params.id });
        res.status(204).send();
    } catch (error) {
        logger.error('Hiba a diák törlése során', { error, studentId: req.params.id });
        res.status(500).json({ message: 'Internal server error' });
    }
}; 