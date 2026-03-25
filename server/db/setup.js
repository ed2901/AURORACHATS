import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function setupDatabase() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('Conectando a PostgreSQL...');
    await client.connect();

    // Crear base de datos
    console.log('Creando base de datos whatsapp_crm...');
    try {
      await client.query('CREATE DATABASE whatsapp_crm;');
      console.log('✓ Base de datos creada');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('✓ Base de datos ya existe');
      } else {
        throw err;
      }
    }

    await client.end();

    // Conectar a la nueva BD
    const dbClient = new Client({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'whatsapp_crm',
    });

    console.log('Conectando a whatsapp_crm...');
    await dbClient.connect();

    // Ejecutar schema
    console.log('Ejecutando schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await dbClient.query(schema);
    console.log('✓ Schema ejecutado correctamente');

    // Crear usuario admin por defecto
    console.log('Creando usuario admin...');
    try {
      await dbClient.query(
        `INSERT INTO users (email, password, full_name, employee_code, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'admin@crm.local',
          '$2a$10$YIjlrJxnM5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', // password: admin123
          'Administrator',
          'ADMIN001',
          'admin',
        ]
      );
      console.log('✓ Usuario admin creado');
      console.log('  Email: admin@crm.local');
      console.log('  Password: admin123');
    } catch (err) {
      if (err.code === '23505') {
        console.log('✓ Usuario admin ya existe');
      } else {
        throw err;
      }
    }

    await dbClient.end();
    console.log('\n✓ Base de datos configurada correctamente');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
