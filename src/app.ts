import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { redisClient } from './config/redis';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
    redis: redisClient && redisClient.isOpen ? 'connected' : 'not configured'
  });
});

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Initialize Redis (optional)
    if (redisClient) {
      try {
        await redisClient.connect();
        console.log('✅ Redis connected');
      } catch (error) {
        console.warn('⚠️  Redis connection failed, continuing without cache:', error);
      }
    }

    // Start server
    const portNumber = typeof PORT === 'string' ? parseInt(PORT) : PORT;
    app.listen(portNumber, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${portNumber}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`📱 Local: http://localhost:${portNumber}`);
      console.log(`📱 Network: http://192.168.1.55:${portNumber}`);
      console.log(`💡 For physical device, use: http://192.168.1.55:${portNumber}/api`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
