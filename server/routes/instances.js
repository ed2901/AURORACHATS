import express from 'express';
import pool from '../db/connection.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { initializeInstance, checkInstanceStatus, disconnectInstance, getQRCode, isInitializing } from '../services/whatsappService.js';

const router = express.Router();

// Create instance (admin only)
router.post('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;

    const result = await pool.query(
      `INSERT INTO instances (phone_number, name, admin_id, is_active) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [phoneNumber, name, req.user.id, true]
    );

    const instance = result.rows[0];
    res.json(instance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all instances (admin/supervisor)
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM instances';
    let params = [];

    if (req.user.role === 'admin') {
      query += ' WHERE admin_id = $1';
      params = [req.user.id];
    } else if (req.user.role === 'supervisor' || req.user.role === 'agent') {
      query += ' WHERE id = $1';
      params = [req.user.instanceId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get instance by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM instances WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update instance (admin only)
router.put('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    const result = await pool.query(
      `UPDATE instances SET name = $1, phone_number = $2, updated_at = NOW() 
       WHERE id = $3 RETURNING *`,
      [name, phoneNumber, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reconnect instance (mark as active)
router.post('/:id/reconnect', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const instanceId = req.params.id;

    // Get instance
    const result = await pool.query(
      'SELECT * FROM instances WHERE id = $1',
      [instanceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    // Initialize WhatsApp connection
    await initializeInstance(instanceId, result.rows[0].phone_number);

    // Mark as active
    const updateResult = await pool.query(
      'UPDATE instances SET is_active = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *',
      [instanceId]
    );

    res.json({ message: 'Instance reconnected', instance: updateResult.rows[0] });
  } catch (error) {
    console.error('Reconnect error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get instance status and generate QR if needed
router.get('/:id/status', verifyToken, async (req, res) => {
  try {
    const instanceId = req.params.id;
    
    // Check if already connected or in demo mode
    let status = checkInstanceStatus(instanceId);
    
    // If not connected and not initializing, initialize Baileys to generate QR
    if (!status.connected && !isInitializing(instanceId)) {
      const result = await pool.query(
        'SELECT phone_number FROM instances WHERE id = $1',
        [instanceId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Instance not found' });
      }
      
      // Initialize Baileys (will generate QR or fall back to demo)
      await initializeInstance(instanceId, result.rows[0].phone_number);
    }
    
    // Wait for QR to be generated (with timeout)
    let attempts = 0;
    const maxAttempts = 15; // 7.5 seconds max
    while (attempts < maxAttempts && !getQRCode(instanceId) && !checkInstanceStatus(instanceId).connected) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    status = checkInstanceStatus(instanceId);
    const qr = getQRCode(instanceId);
    res.json({ ...status, qr });
  } catch (error) {
    console.error('Error in status endpoint:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete instance (admin only)
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const instanceId = req.params.id;

    // Delete all related data (cascade)
    await pool.query('DELETE FROM messages WHERE chat_id IN (SELECT id FROM chats WHERE instance_id = $1)', [instanceId]);
    await pool.query('DELETE FROM chats WHERE instance_id = $1', [instanceId]);
    await pool.query('DELETE FROM clients WHERE instance_id = $1', [instanceId]);
    await pool.query('DELETE FROM users WHERE instance_id = $1', [instanceId]);
    await pool.query('DELETE FROM instances WHERE id = $1', [instanceId]);

    res.json({ message: 'Instance deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
