import express from 'express';
import pool from '../db/connection.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { sendMessage } from '../services/whatsappService.js';
import { validateLanguage, flagMessage } from '../services/languageService.js';

const router = express.Router();

// Get chats for agent
router.get('/agent/my-chats', verifyToken, requireRole(['agent']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cl.phone_number, cl.name, cl.niu, cl.reference
       FROM chats c
       JOIN clients cl ON c.client_id = cl.id
       WHERE c.assigned_agent_id = $1 AND c.status = 'open'
       ORDER BY c.updated_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all chats for instance (supervisor/admin)
router.get('/instance/:instanceId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cl.phone_number, cl.name, cl.niu, cl.reference, u.full_name as agent_name
       FROM chats c
       JOIN clients cl ON c.client_id = cl.id
       LEFT JOIN users u ON c.assigned_agent_id = u.id
       WHERE c.instance_id = $1
       ORDER BY c.updated_at DESC`,
      [req.params.instanceId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get chat messages
router.get('/:chatId/messages', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.full_name as sender_name
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.chatId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Send message
router.post('/:chatId/send', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.chatId;

    // Validate language
    const validation = validateLanguage(content);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Message contains inappropriate language',
        issues: validation.issues,
      });
    }

    // Get chat info
    const chatResult = await pool.query(
      'SELECT * FROM chats WHERE id = $1',
      [chatId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chat = chatResult.rows[0];

    // Get client info
    const clientResult = await pool.query(
      'SELECT phone_number FROM clients WHERE id = $1',
      [chat.client_id]
    );

    const client = clientResult.rows[0];

    // Send via WhatsApp
    await sendMessage(chat.instance_id, client.phone_number, content);

    // Save message
    const messageResult = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, sender_type, content, is_flagged, flag_reason)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        chatId,
        req.user.id,
        'agent',
        content,
        flagMessage(content, validation.issues),
        validation.issues.length > 0 ? JSON.stringify(validation.issues) : null,
      ]
    );

    res.json(messageResult.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reassign chat (supervisor/admin)
router.put('/:chatId/reassign', verifyToken, requireRole(['supervisor', 'admin']), async (req, res) => {
  try {
    const { newAgentId } = req.body;
    const chatId = req.params.chatId;

    const result = await pool.query(
      'UPDATE chats SET assigned_agent_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newAgentId, chatId]
    );

    // Log assignment
    await pool.query(
      'INSERT INTO chat_assignments (chat_id, assigned_to_id, assigned_by_id) VALUES ($1, $2, $3)',
      [chatId, newAgentId, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Close chat
router.put('/:chatId/close', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE chats SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['closed', req.params.chatId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
