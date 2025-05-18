import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRATION || '24h',  // Increased from 1h to 24h
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
