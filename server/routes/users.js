import express from 'express';
import bcryptjs from 'bcryptjs';
import pool from '../db/connection.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Create user (admin only)
router.post('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { email, fullName, employeeCode, role, instanceId } = req.body;
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcryptjs.hash(tempPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, employee_code, role, instance_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, role, instance_id`,
      [email, hashedPassword, fullName, employeeCode, role, instanceId]
    );

    res.json({
      user: result.rows[0],
      tempPassword,
      message: 'User created. Share temp password with user.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get users for instance
router.get('/instance/:instanceId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, employee_code, role, instance_id FROM users WHERE instance_id = $1',
      [req.params.instanceId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user (admin only)
router.put('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { fullName, email, role } = req.body;

    const result = await pool.query(
      'UPDATE users SET full_name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, email, full_name, role',
      [fullName, email, role, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset user password (admin only)
router.post('/:id/reset-password', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;
    
    // Si no se proporciona contraseña, generar una temporal
    const passwordToUse = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcryptjs.hash(passwordToUse, 10);

    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email, full_name',
      [hashedPassword, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0],
      tempPassword: passwordToUse,
      message: 'Password reset. Share new password with user.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is admin
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
