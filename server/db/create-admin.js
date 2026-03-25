import bcryptjs from 'bcryptjs';
import pool from '../db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcryptjs.hash(password, 10);

    await pool.query(
      `DELETE FROM users WHERE email = 'admin@crm.local'`
    );

    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, employee_code, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        'admin@crm.local',
        hashedPassword,
        'Administrator',
        'ADMIN001',
        'admin',
      ]
    );

    console.log('✓ Usuario admin creado correctamente');
    console.log('Email:', result.rows[0].email);
    console.log('Password: admin123');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
