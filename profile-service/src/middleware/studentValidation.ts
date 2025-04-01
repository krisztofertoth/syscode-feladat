import { body } from 'express-validator';

export const validateStudent = [
    body('email')
        .isEmail()
        .withMessage('Érvénytelen email cím formátum')
]; 