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
  
  // Check if Redis is configured
  const redisHost = process.env.REDIS_HOST;
  if (!redisHost || redisHost === '') {
    return null; // No Redis configured
  }
  
  // Fallback to individual env vars for local development
  return {
    socket: {
      host: redisHost,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || undefined,
  };
};

const config = getRedisConfig();

// Create Redis client only if configured
export const redisClient = config ? createClient(config) : null;

if (redisClient) {
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis Client Connected');
  });
} else {
  console.log('⚠️  Redis not configured - running without cache');
}

export default redisClient;
