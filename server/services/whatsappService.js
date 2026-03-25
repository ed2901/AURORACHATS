// WhatsApp Service - Con Baileys (con fallback a demo mode)
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionsDir = path.join(__dirname, '../.wwebjs_auth');

// Create a silent logger
const logger = pino({ level: 'silent' });

// Helper to generate QR code synchronously
const generateQRCode = (text) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(text, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
};

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
    
    // Check if demo mode is explicitly enabled
    const useDemoMode = process.env.DEMO_MODE === 'true' && process.env.NODE_ENV === 'production';
    
    if (useDemoMode) {
      console.log(`[Instance ${instanceId}] Starting in DEMO MODE`);
      demoMode.add(instanceId);
      
      // Generate a demo QR code
      const demoQR = `demo-${instanceId}-${Date.now()}`;
      try {
        const url = await generateQRCode(demoQR);
        qrCodes.set(instanceId, url);
        console.log(`[Instance ${instanceId}] Demo QR code generated`);
      } catch (err) {
        console.error(`[Instance ${instanceId}] Error generating demo QR:`, err.message);
      }
      
      initializingInstances.delete(instanceId);
      return;
    }
    
    const sessionPath = path.join(sessionsDir, `session-instance_${instanceId}`);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
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

    let qrGenerated = false;
    let connectionAttempts = 0;
    const maxAttempts = 3;
    
    // Generate a temporary demo QR immediately while waiting for real connection
    const tempDemoQR = `temp-demo-${instanceId}-${Date.now()}`;
    try {
      const tempUrl = await generateQRCode(tempDemoQR);
      qrCodes.set(instanceId, tempUrl);
      console.log(`[Instance ${instanceId}] Temporary demo QR generated while connecting...`);
    } catch (err) {
      console.error(`[Instance ${instanceId}] Error generating temp QR:`, err.message);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Generate QR code
      if (qr) {
        qrGenerated = true;
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
        demoMode.delete(instanceId);
        qrCodes.delete(instanceId);
        initializingInstances.delete(instanceId);
      }

      if (connection === 'close') {
        connectionAttempts++;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[Instance ${instanceId}] Connection closed (attempt ${connectionAttempts}/${maxAttempts}). Reconnect: ${shouldReconnect}`);
        console.log(`[Instance ${instanceId}] Error:`, lastDisconnect?.error?.message || 'unknown');
        console.log(`[Instance ${instanceId}] Status code:`, statusCode);

        if (shouldReconnect && connectionAttempts < maxAttempts) {
          console.log(`[Instance ${instanceId}] Retrying connection in 3 seconds...`);
          setTimeout(() => {
            if (initializingInstances.has(instanceId)) {
              initializeInstance(instanceId, phoneNumber);
            }
          }, 3000);
        } else if (connectionAttempts >= maxAttempts) {
          // Fallback to demo mode after max attempts
          console.log(`[Instance ${instanceId}] Max connection attempts reached. Using demo mode`);
          demoMode.add(instanceId);
          activeInstances.delete(instanceId);
          initializingInstances.delete(instanceId);
        } else {
          activeInstances.delete(instanceId);
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

export const isInitializing = (instanceId) => {
  return initializingInstances.has(instanceId);
};
