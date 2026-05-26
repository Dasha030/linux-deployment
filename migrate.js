const fs = require('fs');
const { Client } = require('pg');

const config = JSON.parse(fs.readFileSync('/etc/mywebapp/config.json', 'utf8'));
const client = new Client(config.db);

async function runMigration() {
    try {
        await client.connect();
        console.log('Підключено до БД для виконання міграції...');
        
        const queryText = `
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await client.query(queryText);
        console.log('Міграція успішно виконана (таблиця notes готова).');
    } catch (err) {
        console.error('Помилка під час міграції:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
