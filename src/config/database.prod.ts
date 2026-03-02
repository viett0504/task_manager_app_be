import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL for Render PostgreSQL
const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Render provides DATABASE_URL in format: postgresql://user:password@host:port/database
    return {
      url: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    };
  }
  
  // Fallback to individual env vars
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'taskflow_ai',
  };
};

const config = getDatabaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(config.url ? { url: config.url, ssl: config.ssl } : config),
  synchronize: false, // Never use true in production
  logging: process.env.NODE_ENV === 'development',
  entities: [
    __dirname + '/../models/**/*.{js,ts}',
  ],
  migrations: [
    __dirname + '/../migrations/**/*.{js,ts}',
  ],
  subscribers: [],
});
