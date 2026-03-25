import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/connection.js';
import { initializeInstance } from './services/whatsappService.js';
import authRoutes from './routes/auth.js';
import instanceRoutes from './routes/instances.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chats.js';
import clientRoutes from './routes/clients.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Permitir todo si CORS_ORIGIN es *
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/instances', instanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/clients', clientRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Auto-inicializar instancias activas al arrancar
  try {
    const result = await pool.query('SELECT id, phone_number FROM instances WHERE is_active = true');
    for (const instance of result.rows) {
      console.log(`Auto-initializing instance ${instance.id}...`);
      initializeInstance(instance.id, instance.phone_number).catch(err => {
        console.error(`Error auto-initializing instance ${instance.id}:`, err.message);
      });
    }
  } catch (err) {
    console.error('Error loading instances on startup:', err.message);
  }
});
