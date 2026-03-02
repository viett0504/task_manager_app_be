import { AppDataSource } from '../config/database';
import { Milestone } from '../models/Milestone';
import { Sprint } from '../models/Sprint';

async function seedMilestones() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const milestoneRepository = AppDataSource.getRepository(Milestone);
    const sprintRepository = AppDataSource.getRepository(Sprint);

    // Get active sprint
    const activeSprint = await sprintRepository.findOne({
      where: { status: 'active' },
    });

    if (!activeSprint) {
      console.log('No active sprint found');
      process.exit(0);
    }

    // Clear existing milestones
    await milestoneRepository.delete({ sprint_id: activeSprint.id });

    // Create milestones
    const milestones = [
      {
        sprint_id: activeSprint.id,
        title: 'Architecture Review',
        due_date: new Date('2026-03-13'),
        is_completed: true,
        progress: 100,
      },
      {
        sprint_id: activeSprint.id,
        title: 'API Documentation',
        due_date: new Date('2026-03-15'),
        is_completed: true,
        progress: 100,
      },
      {
        sprint_id: activeSprint.id,
        title: 'Core Feature Freeze',
        due_date: new Date('2026-03-17'),
        is_completed: false,
        progress: 65,
      },
      {
        sprint_id: activeSprint.id,
        title: 'User Acceptance Tests',
        due_date: new Date('2026-03-19'),
        is_completed: false,
        progress: 0,
      },
    ];

    for (const milestoneData of milestones) {
      const milestone = milestoneRepository.create(milestoneData);
      await milestoneRepository.save(milestone);
      console.log(`Created milestone: ${milestone.title}`);
    }

    console.log('✅ Milestones seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding milestones:', error);
    process.exit(1);
  }
}

seedMilestones();
