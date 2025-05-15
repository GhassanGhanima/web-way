import { registerAs } from '@nestjs/config';

export default registerAs('cdn', () => ({
  baseUrl: process.env.CDN_BASE_URL || 'http://localhost:3000/api',
  storagePath: process.env.CDN_STORAGE_PATH || 'assets/scripts',
  tokenSecret: process.env.CDN_TOKEN_SECRET || 'cdnSecretKey123',
  maxFileSize: parseInt(process.env.CDN_MAX_FILE_SIZE || '5242880', 10), // 5MB default
  allowedOrigins: (process.env.CDN_ALLOWED_ORIGINS || '*').split(','),
}));
