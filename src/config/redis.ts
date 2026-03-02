import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Parse REDIS_URL for production (Render Redis)
const getRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    // Render provides REDIS_URL in format: redis://user:password@host:port
    return { url: redisUrl };
  }
  
  // Fallback to individual env vars for local development
  return {
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || undefined,
  };
};

export const redisClient = createClient(getRedisConfig());

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

export default redisClient;
