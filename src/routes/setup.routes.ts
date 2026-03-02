import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { execSync } from 'child_process';

const router = Router();

// IMPORTANT: Only use in development or first-time setup
// Remove or protect this endpoint in production
router.post('/run-migrations', async (req: Request, res: Response) => {
  try {
    console.log('Running migrations...');
    
    // Run migrations
    await AppDataSource.runMigrations();
    
    res.json({
      success: true,
      message: 'Migrations completed successfully',
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'MIGRATION_ERROR',
      },
    });
  }
});

router.post('/seed-data', async (req: Request, res: Response) => {
  try {
    console.log('Seeding data...');
    
    // Import and run seed scripts
    const { seedDatabase } = await import('../scripts/seed');
    await seedDatabase();
    
    res.json({
      success: true,
      message: 'Data seeded successfully',
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'SEED_ERROR',
      },
    });
  }
});

export default router;
