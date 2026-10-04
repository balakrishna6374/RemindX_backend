import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/certialert',
  JWT_SECRET: process.env.JWT_SECRET || 'certialert_jwt_super_secret_key_2026_production_grade_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"CertiAlert Alerts" <no-reply@certialert.com>',
  
  ADMIN_NAME: process.env.ADMIN_NAME || 'CertiAlert Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@certialert.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@CertiAlert2026!',
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  CRON_SCHEDULE: process.env.CRON_SCHEDULE || '0 8 * * *'
};

