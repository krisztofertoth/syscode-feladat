import axios from 'axios';
import { performance } from 'perf_hooks';
import { faker } from '@faker-js/faker';

const BASE_URL = 'http://localhost:3000';
const AUTH = {
    username: 'admin',
    password: 'admin123'
};

// Egyedi email címek tárolása
const usedEmails = new Set<string>();

function generateUniqueEmail(): string {
    let email: string;
    do {
        email = faker.internet.email();
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    return email;
}

async function createStudent(retryCount = 3): Promise<any> {
    const studentData = {
        name: faker.person.fullName(),
        email: generateUniqueEmail()
    };

    try {
        const response = await axios.post(`${BASE_URL}/api/students`, studentData, {
            auth: AUTH
        });
        return response.data;
    } catch (error: any) {
        if (retryCount > 0) {
            console.log(`Újrapróbálkozás: ${studentData.email} (${retryCount} próbálkozás hátra)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 másodperc várakozás
            return createStudent(retryCount - 1);
        }
        throw error;
    }
}

async function runLoadTest() {
    const totalStudents = 10000;
    const batchSize = 100;
    const results = {
        totalTime: 0,
        averageTimePerStudent: 0,
        successful: 0,
        failed: 0,
        retries: 0
    };

    console.log(`Load test indítása: ${totalStudents} diák létrehozása...`);
    const startTime = performance.now();

    for (let i = 0; i < totalStudents; i += batchSize) {
        const batchStartTime = performance.now();
        const batch = Math.min(batchSize, totalStudents - i);
        const promises = [];

        for (let j = 0; j < batch; j++) {
            promises.push(createStudent());
        }

        try {
            await Promise.all(promises);
            results.successful += batch;
            const batchTime = performance.now() - batchStartTime;
            console.log(`Batch ${i / batchSize + 1} befejezve: ${batch} diák, ${(batchTime / 1000).toFixed(2)} másodperc`);
        } catch (error: any) {
            results.failed += batch;
            console.error(`Hiba a batch ${i / batchSize + 1} feldolgozása során:`, error.message);
        }
    }

    results.totalTime = performance.now() - startTime;
    results.averageTimePerStudent = results.totalTime / results.successful;

    console.log('\nLoad test eredmények:');
    console.log(`Összes idő: ${(results.totalTime / 1000).toFixed(2)} másodperc`);
    console.log(`Átlagos idő diákonként: ${(results.averageTimePerStudent / 1000).toFixed(3)} másodperc`);
    console.log(`Sikeres létrehozások: ${results.successful}`);
    console.log(`Sikertelen létrehozások: ${results.failed}`);
    console.log(`Egyedi email címek száma: ${usedEmails.size}`);
}

// Futtatás
runLoadTest().catch(console.error); 