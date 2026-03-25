import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import pool from '../db/connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = pino({ level: 'silent' });

const generateQRCode = (text) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(text, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
};

// Auth state usando PostgreSQL
const usePostgresAuthState = async (instanceId) => {
  const writeData = async (data, key) => {
    const json = JSON.stringify(data, BufferJSON.replacer);
    if (key === 'creds') {
      await pool.query(
        `INSERT INTO whatsapp_sessions (instance_id, creds, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (instance_id) DO UPDATE SET creds = $2, updated_at = NOW()`,
        [instanceId, json]
      );
    } else {
      await pool.query(
        `UPDATE whatsapp_sessions SET keys = $2, updated_at = NOW() WHERE instance_id = $1`,
        [instanceId, json]
      );
    }
  };

  const readData = async (key) => {
    try {
      const result = await pool.query(
        `SELECT ${key} FROM whatsapp_sessions WHERE instance_id = $1`,
        [instanceId]
      );
      if (result.rows.length === 0 || !result.rows[0][key]) return null;
      return JSON.parse(result.rows[0][key], BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  const creds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const keysData = (await readData('keys')) || {};
          const data = {};
          for (const id of ids) {
            const val = keysData[`${type}-${id}`];
            if (val) data[id] = val;
          }
          return data;
        },
        set: async (data) => {
          const keysData = (await readData('keys')) || {};
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              keysData[`${category}-${id}`] = data[category][id];
            }
          }
          await writeData(keysData, 'keys');
        },
      },
    },
    saveCreds: async () => {
      await writeData(creds, 'creds');
    },
  };
};

const activeInstances = new Map();
const qrCodes = new Map();
const initializingInstances = new Set();

export const initializeInstance = async (instanceId, phoneNumber) => {
  try {
    if (initializingInstances.has(instanceId)) {
      console.log(`[Instance ${instanceId}] Already initializing, skipping...`);
      return;
    }

    // Cerrar socket existente si hay uno
    const existingSock = activeInstances.get(instanceId);
    if (existingSock) {
      try { existingSock.end(); } catch (e) {}
      activeInstances.delete(instanceId);
    }

    initializingInstances.add(instanceId);

    const { state, saveCreds } = await usePostgresAuthState(instanceId);
    const { version } = await fetchLatestBaileysVersion();
    console.log(`[Instance ${instanceId}] Using WA version: ${version.join('.')}`);

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
      markOnlineOnConnect: false,
      logger: logger,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
    });

    let connectionAttempts = 0;
    const maxAttempts = 5;

    sock.ev.on('creds.update', saveCreds);

    // Listener para mensajes entrantes
    sock.ev.on('messages.upsert', async ({ messages: incomingMessages, type }) => {
      if (type !== 'notify') return;

      for (const msg of incomingMessages) {
        // Ignorar mensajes propios y de grupos
        if (msg.key.fromMe || msg.key.remoteJid.endsWith('@g.us')) continue;

        const senderPhone = msg.key.remoteJid.replace('@s.whatsapp.net', '');
        const content = msg.message?.conversation
          || msg.message?.extendedTextMessage?.text
          || msg.message?.imageMessage?.caption
          || null;

        if (!content) continue;

        try {
          // Buscar o crear cliente
          let clientResult = await pool.query(
            'SELECT id FROM clients WHERE instance_id = $1 AND phone_number = $2',
            [instanceId, senderPhone]
          );

          let clientId;
          if (clientResult.rows.length === 0) {
            const newClient = await pool.query(
              'INSERT INTO clients (instance_id, phone_number) VALUES ($1, $2) RETURNING id',
              [instanceId, senderPhone]
            );
            clientId = newClient.rows[0].id;
          } else {
            clientId = clientResult.rows[0].id;
          }

          // Buscar o crear chat abierto
          let chatResult = await pool.query(
            `SELECT id FROM chats WHERE instance_id = $1 AND client_id = $2 AND status = 'open'`,
            [instanceId, clientId]
          );

          let chatId;
          if (chatResult.rows.length === 0) {
            const newChat = await pool.query(
              'INSERT INTO chats (instance_id, client_id) VALUES ($1, $2) RETURNING id',
              [instanceId, clientId]
            );
            chatId = newChat.rows[0].id;
          } else {
            chatId = chatResult.rows[0].id;
          }

          // Guardar mensaje
          await pool.query(
            `INSERT INTO messages (chat_id, sender_type, content) VALUES ($1, 'client', $2)`,
            [chatId, content]
          );

          // Actualizar timestamp del chat
          await pool.query('UPDATE chats SET updated_at = NOW() WHERE id = $1', [chatId]);

          console.log(`[Instance ${instanceId}] Incoming message from ${senderPhone} saved`);
        } catch (err) {
          console.error(`[Instance ${instanceId}] Error saving incoming message:`, err.message);
        }
      }
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        generateQRCode(qr).then(url => {
          qrCodes.set(instanceId, url);
          console.log(`[Instance ${instanceId}] Real QR code generated`);
        }).catch(err => {
          console.error(`[Instance ${instanceId}] Error generating QR:`, err.message);
        });
      }

      if (connection === 'open') {
        console.log(`[Instance ${instanceId}] Connected successfully`);
        activeInstances.set(instanceId, sock);
        qrCodes.delete(instanceId);
        initializingInstances.delete(instanceId);
        connectionAttempts = 0;
        // Marcar instancia como activa en BD
        pool.query('UPDATE instances SET is_active = true WHERE id = $1', [instanceId]).catch(() => {});
      }

      if (connection === 'close') {
        connectionAttempts++;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(`[Instance ${instanceId}] Connection closed (attempt ${connectionAttempts}/${maxAttempts}). Status: ${statusCode}`);

        activeInstances.delete(instanceId);

        if (isLoggedOut) {
          console.log(`[Instance ${instanceId}] Logged out, clearing session...`);
          pool.query('DELETE FROM whatsapp_sessions WHERE instance_id = $1', [instanceId]).catch(() => {});
          pool.query('UPDATE instances SET is_active = false WHERE id = $1', [instanceId]).catch(() => {});
          initializingInstances.delete(instanceId);
        } else if (connectionAttempts < maxAttempts) {
          console.log(`[Instance ${instanceId}] Retrying in 5 seconds...`);
          setTimeout(() => {
            initializingInstances.delete(instanceId);
            initializeInstance(instanceId, phoneNumber);
          }, 5000);
        } else {
          console.log(`[Instance ${instanceId}] Max attempts reached.`);
          initializingInstances.delete(instanceId);
        }
      }
    });

    return sock;
  } catch (error) {
    console.error(`[Instance ${instanceId}] Error initializing:`, error.message);
    initializingInstances.delete(instanceId);
    throw error;
  }
};

export const checkInstanceStatus = (instanceId) => {
  const sock = activeInstances.get(instanceId);
  if (!sock) return { connected: false };
  return { connected: !!sock.user, user: sock.user };
};

export const getQRCode = (instanceId) => {
  return qrCodes.get(instanceId) || null;
};

export const sendMessage = async (instanceId, clientPhone, message) => {
  try {
    const sock = activeInstances.get(instanceId);
    if (!sock) throw new Error('Instance not connected');
    const jid = clientPhone.includes('@') ? clientPhone : `${clientPhone}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    console.log(`[Instance ${instanceId}] Message sent to ${clientPhone}`);
    return true;
  } catch (error) {
    console.error(`[Instance ${instanceId}] Error sending message:`, error.message);
    throw error;
  }
};

export const disconnectInstance = async (instanceId) => {
  try {
    const sock = activeInstances.get(instanceId);
    if (sock) {
      await sock.logout();
      activeInstances.delete(instanceId);
    }
    qrCodes.delete(instanceId);
    initializingInstances.delete(instanceId);
    console.log(`[Instance ${instanceId}] Disconnected`);
  } catch (error) {
    console.error(`[Instance ${instanceId}] Error disconnecting:`, error.message);
  }
};

export const getActiveInstances = () => Array.from(activeInstances.keys());
export const isInitializing = (instanceId) => initializingInstances.has(instanceId);
