// WhatsApp Service - Con Baileys (con fallback a demo mode)
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionsDir = path.join(__dirname, '../.wwebjs_auth');

// Create a silent logger
const logger = pino({ level: 'silent' });

// Almacenar instancias activas y QR codes
const activeInstances = new Map();
const qrCodes = new Map();
const initializingInstances = new Set();
const demoMode = new Set(); // Instancias en modo demo

export const initializeInstance = async (instanceId, phoneNumber) => {
  try {
    // Prevent duplicate initialization
    if (initializingInstances.has(instanceId)) {
      console.log(`[Instance ${instanceId}] Already initializing, skipping...`);
      return;
    }
    
    initializingInstances.add(instanceId);
    
    const sessionPath = path.join(sessionsDir, `session-instance_${instanceId}`);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['Aurora Chat', 'Chrome', '120.0.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      logger: logger,
      connectTimeoutMs: 10000,
    });

    let qrGenerated = false;
    let connectionAttempts = 0;
    const maxAttempts = 3;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Generate QR code
      if (qr) {
        qrGenerated = true;
        QRCode.toDataURL(qr, (err, url) => {
          if (!err) {
            qrCodes.set(instanceId, url);
            console.log(`[Instance ${instanceId}] QR code generated`);
          }
        });
      }

      if (connection === 'open') {
        console.log(`[Instance ${instanceId}] Connected successfully`);
        activeInstances.set(instanceId, sock);
        demoMode.delete(instanceId);
        qrCodes.delete(instanceId);
        initializingInstances.delete(instanceId);
      }

      if (connection === 'close') {
        connectionAttempts++;
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(`[Instance ${instanceId}] Connection closed (attempt ${connectionAttempts}/${maxAttempts}). Reconnect: ${shouldReconnect}`);

        if (shouldReconnect && connectionAttempts < maxAttempts) {
          setTimeout(() => initializeInstance(instanceId, phoneNumber), 3000);
        } else if (connectionAttempts >= maxAttempts && !qrGenerated) {
          // Fallback to demo mode
          console.log(`[Instance ${instanceId}] Switching to DEMO MODE (no WhatsApp connection available)`);
          demoMode.add(instanceId);
          
          // Generate a demo QR code
          const demoQR = `demo-${instanceId}-${Date.now()}`;
          QRCode.toDataURL(demoQR, (err, url) => {
            if (!err) {
              qrCodes.set(instanceId, url);
              console.log(`[Instance ${instanceId}] Demo QR code generated`);
            }
          });
          
          initializingInstances.delete(instanceId);
        } else {
          activeInstances.delete(instanceId);
          qrCodes.delete(instanceId);
          demoMode.delete(instanceId);
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
  // Check if in demo mode
  if (demoMode.has(instanceId)) {
    return { connected: true, demo: true };
  }
  
  const sock = activeInstances.get(instanceId);
  if (!sock) return { connected: false };
  return { connected: !!sock.user, user: sock.user };
};

export const getQRCode = (instanceId) => {
  const qr = qrCodes.get(instanceId);
  return qr || null;
};

export const sendMessage = async (instanceId, clientPhone, message) => {
  try {
    // Demo mode: just log the message
    if (demoMode.has(instanceId)) {
      console.log(`[Instance ${instanceId}] DEMO: Message to ${clientPhone}: ${message}`);
      return true;
    }

    const sock = activeInstances.get(instanceId);
    if (!sock || !sock.user) {
      throw new Error('Instance not connected');
    }

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
    demoMode.delete(instanceId);
    initializingInstances.delete(instanceId);
    console.log(`[Instance ${instanceId}] Disconnected`);
  } catch (error) {
    console.error(`[Instance ${instanceId}] Error disconnecting:`, error.message);
  }
};

export const getActiveInstances = () => {
  return Array.from(activeInstances.keys());
};
