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

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
