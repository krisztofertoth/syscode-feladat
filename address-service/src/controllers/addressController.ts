import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

const generateRandomAddress = (): string => {
  const streets = ['Kossuth', 'Petőfi', 'Rákóczi', 'Andrássy', 'Váci', 'Bajcsy-Zsilinszky', 'Rottenbiller'];
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const cities = ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza'];
  
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = numbers[Math.floor(Math.random() * numbers.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  return `${street} utca ${number}, ${city}`;
};

export const getRandomAddress = async (req: Request, res: Response) => {
  try {
    const address = {
      id: uuidv4(),
      address: generateRandomAddress()
    };
    
    logger.info('Véletlenszerű cím generálva', { addressId: address.id });
    res.json(address);
  } catch (error) {
    logger.error('Hiba a cím generálása során', { error });
    res.status(500).json({ message: 'Internal server error' });
  }
}; 