import express from 'express';
import pool from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create or update client
router.post('/', verifyToken, async (req, res) => {
  try {
    const { instanceId, phoneNumber, name, niu, reference } = req.body;

    const result = await pool.query(
      `INSERT INTO clients (instance_id, phone_number, name, niu, reference)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (instance_id, phone_number) 
       DO UPDATE SET name = $3, niu = $4, reference = $5
       RETURNING *`,
      [instanceId, phoneNumber, name, niu, reference]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get clients for instance
router.get('/instance/:instanceId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients WHERE instance_id = $1 ORDER BY created_at DESC',
      [req.params.instanceId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start new chat with client
router.post('/:clientId/start-chat', verifyToken, async (req, res) => {
  try {
    const clientId = req.params.clientId;

    // Get client info
    const clientResult = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [clientId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const client = clientResult.rows[0];

    // Check if chat already exists
    const existingChat = await pool.query(
      'SELECT id FROM chats WHERE client_id = $1 AND status = $2',
      [clientId, 'open']
    );

    if (existingChat.rows.length > 0) {
      return res.json(existingChat.rows[0]);
    }

    // Create new chat
    const chatResult = await pool.query(
      `INSERT INTO chats (instance_id, client_id, assigned_agent_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [client.instance_id, clientId, req.user.id]
    );

    res.json(chatResult.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
