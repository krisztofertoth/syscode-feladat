import express from 'express';
import { getRandomAddress } from './controllers/addressController';
import logger from './config/logger';
import auth from './middleware/auth';

export const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Address végpont védelme
app.get('/api/address', auth, getRandomAddress);

// 404-es kezelése
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Csak akkor indítjuk el a szervert, ha nem tesztből futtatjuk
export let server: any;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        logger.info(`Address service fut a következő porton: ${PORT}`);
    });
} 