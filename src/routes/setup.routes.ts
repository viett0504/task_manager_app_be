import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';

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

router.post('/seed-all', async (req: Request, res: Response) => {
  try {
    console.log('Seeding all data...');
    
    const { seedAll } = await import('../scripts/seed-all');
    await seedAll();
    
    res.json({
      success: true,
      message: 'All data seeded successfully! Login with admin@gmail.com / 1',
    });
  } catch (error: any) {
    console.error('Seed all error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'SEED_ALL_ERROR',
      },
    });
  }
});

router.post('/reset-database', async (req: Request, res: Response) => {
  try {
    console.log('Resetting database...');
    
    // Clear all data using clear() instead of delete({})
    const taskRepo = AppDataSource.getRepository('Task');
    const milestoneRepo = AppDataSource.getRepository('Milestone');
    const sprintRepo = AppDataSource.getRepository('Sprint');
    const teamMemberRepo = AppDataSource.getRepository('TeamMember');
    const teamRepo = AppDataSource.getRepository('Team');
    const userRepo = AppDataSource.getRepository('User');
    
    await taskRepo.clear();
    await milestoneRepo.clear();
    await sprintRepo.clear();
    await teamMemberRepo.clear();
    await teamRepo.clear();
    await userRepo.clear();
    
    console.log('All data deleted');
    
    // Seed data
    const { seedAll } = await import('../scripts/seed-all');
    await seedAll();
    
    res.json({
      success: true,
      message: 'Database reset and seeded successfully!',
    });
  } catch (error: any) {
    console.error('Reset database error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'RESET_ERROR',
      },
    });
  }
});

export default router;
