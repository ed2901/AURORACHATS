import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import pool from '../db/connection.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

export const register = async (req, res) => {
  try {
    const { email, password, fullName, employeeCode, role } = req.body;

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, employee_code, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role`,
      [email, hashedPassword, fullName, employeeCode, role]
    );

    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ user: result.rows[0], token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find user by email or employee_code
    let result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // If not found by email, try by employee_code
    if (result.rows.length === 0) {
      result = await pool.query(
        'SELECT * FROM users WHERE employee_code = $1',
        [email]
      );
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcryptjs.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, instanceId: user.instance_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        instanceId: user.instance_id,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

router.post('/register', register);
router.post('/login', login);

export default router;
