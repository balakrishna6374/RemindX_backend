import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import telegramRoutes from './routes/telegramRoutes.js';

const app = express();

// Trust reverse proxy (Vercel, Render, Cloudflare, Nginx)
app.set('trust proxy', 1);

// CORS configuration - MUST BE FIRST so all responses & preflights get CORS headers
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow all vercel preview/prod deployments, localhost, and custom frontend URLs
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      (env.FRONTEND_URL && origin === env.FRONTEND_URL) ||
      env.NODE_ENV === 'development'
    ) {
      return callback(null, true);
    }

    // Default allow for web clients
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security Headers (configured to allow cross-origin API access)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB is connected
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('[DB Check] Database connection error:', err.message);
      return res.status(503).json({
        success: false,
        message: 'Database connection in progress or unavailable. Please retry in a few moments.',
      });
    }
  }
  next();
});

// General Rate Limiting
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RemindX API is operational',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
  });
});

// Root route for Render service check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RemindX API Server is running',
    docs: '/api/health',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/telegram', telegramRoutes);

// Catch 404s
app.use(notFoundHandler);

// Centralized Error Handling
app.use(errorHandler);

export default app;
