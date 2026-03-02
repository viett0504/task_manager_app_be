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

router.post('/seed-tasks', async (req: Request, res: Response) => {
  try {
    console.log('Seeding tasks...');
    
    const { seedTasks } = await import('../scripts/seed-tasks');
    await seedTasks();
    
    res.json({
      success: true,
      message: 'Tasks seeded successfully',
    });
  } catch (error: any) {
    console.error('Seed tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'SEED_TASKS_ERROR',
      },
    });
  }
});

router.post('/seed-more-tasks', async (req: Request, res: Response) => {
  try {
    console.log('Seeding more tasks...');
    
    const { seedMoreTasks } = await import('../scripts/seed-more-tasks');
    await seedMoreTasks();
    
    res.json({
      success: true,
      message: 'More tasks seeded successfully',
    });
  } catch (error: any) {
    console.error('Seed more tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'SEED_MORE_TASKS_ERROR',
      },
    });
  }
});

router.post('/seed-team-members', async (req: Request, res: Response) => {
  try {
    console.log('Seeding team members...');
    
    const { seedTeamMembers } = await import('../scripts/seed-team-members');
    await seedTeamMembers();
    
    res.json({
      success: true,
      message: 'Team members seeded successfully',
    });
  } catch (error: any) {
    console.error('Seed team members error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'SEED_TEAM_MEMBERS_ERROR',
      },
    });
  }
});

router.post('/seed-milestones', async (req: Request, res: Response) => {
  try {
    console.log('Seeding milestones...');
    
    const { seedMilestones } = await import('../scripts/seed-milestones');
    await seedMilestones();
    
    res.json({
      success: true,
      message: 'Milestones seeded successfully',
    });
  } catch (error: any) {
    console.error('Seed milestones error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: 'SEED_MILESTONES_ERROR',
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

export default router;
