import basicAuth from 'express-basic-auth';
import logger from '../config/logger';

const auth = basicAuth({
    users: { 
        [process.env.AUTH_USER || 'admin']: process.env.AUTH_PASSWORD || 'admin123' 
    },
    challenge: true,
    unauthorizedResponse: () => ({ message: 'Unauthorized' })
});

// Wrapper middleware a logoláshoz
const authMiddleware = (req: any, res: any, next: any) => {
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
        if (res.statusCode === 401) {
            logger.warn('Sikertelen bejelentkezési kísérlet', {
                ip: req.ip,
                user: req.auth?.user
            });
        }
        originalEnd.apply(res, args);
    };
    auth(req, res, next);
};

export default authMiddleware; 