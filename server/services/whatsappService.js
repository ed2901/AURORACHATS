import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionsDir = path.join(__dirname, '../.wwebjs_auth');
const logger = pino({ level: 'silent' });

const generateQRCode = (text) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(text, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
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

    initializingInstances.add(instanceId);

    const sessionPath = path.join(sessionsDir, `session-instance_${instanceId}`);
    fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
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
      }

      if (connection === 'close') {
        connectionAttempts++;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(`[Instance ${instanceId}] Connection closed (attempt ${connectionAttempts}/${maxAttempts}). Status: ${statusCode}`);

        activeInstances.delete(instanceId);

        if (isLoggedOut) {
          console.log(`[Instance ${instanceId}] Logged out, clearing session...`);
          if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
          }
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
    console.log(`[Instance ${instanceId}] Attempting to send. Active instances:`, Array.from(activeInstances.keys()));
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
