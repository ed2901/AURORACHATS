import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Conectando a PostgreSQL...');
    await client.connect();

    const schema = fs.readFileSync(path.join(__dirname, 'railway-setup.sql'), 'utf8');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await client.query(statement);
      } catch (err) {
        if (err.code === '42P07' || err.message.includes('already exists')) {
          // ignorar si ya existe
        } else {
          console.error('Error en statement:', err.message);
        }
      }
    }

    console.log('✓ Base de datos configurada correctamente');
    await client.end();
  } catch (error) {
    console.error('Error setup:', error.message);
    process.exit(1);
  }
}

setupDatabase();
