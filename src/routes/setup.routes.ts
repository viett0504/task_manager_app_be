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
    
    // Import models
    const { Task } = await import('../models/Task');
    const { Milestone } = await import('../models/Milestone');
    const { Sprint } = await import('../models/Sprint');
    const { TeamMember } = await import('../models/TeamMember');
    const { Team } = await import('../models/Team');
    const { User } = await import('../models/User');
    
    // Delete in correct order (child tables first)
    const taskRepo = AppDataSource.getRepository(Task);
    const milestoneRepo = AppDataSource.getRepository(Milestone);
    const sprintRepo = AppDataSource.getRepository(Sprint);
    const teamMemberRepo = AppDataSource.getRepository(TeamMember);
    const teamRepo = AppDataSource.getRepository(Team);
    const userRepo = AppDataSource.getRepository(User);
    
    // Delete all records (order matters due to foreign keys)
    await taskRepo.createQueryBuilder().delete().execute();
    await milestoneRepo.createQueryBuilder().delete().execute();
    await sprintRepo.createQueryBuilder().delete().execute();
    await teamMemberRepo.createQueryBuilder().delete().execute();
    await teamRepo.createQueryBuilder().delete().execute();
    await userRepo.createQueryBuilder().delete().execute();
    
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
