import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  REDIS_URL: process.env.REDIS_URL,
  REDIS_TTL: parseInt(process.env.REDIS_TTL || '3600', 10),
  JWT_SECRET: process.env.JWT_SECRET,
}));
