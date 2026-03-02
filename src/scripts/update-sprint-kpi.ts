import { AppDataSource } from '../config/database';
import { Sprint } from '../models/Sprint';

async function updateSprintKPI() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const sprintRepository = AppDataSource.getRepository(Sprint);

    // Get active sprint
    const activeSprint = await sprintRepository.findOne({
      where: { status: 'active' },
    });

    if (!activeSprint) {
      console.log('No active sprint found');
      process.exit(0);
    }

    // Update KPI values
    activeSprint.velocity = 42;
    activeSprint.efficiency = 94;

    await sprintRepository.save(activeSprint);

    console.log('✅ Sprint KPI updated successfully');
    console.log(`   Velocity: ${activeSprint.velocity}`);
    console.log(`   Efficiency: ${activeSprint.efficiency}%`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating sprint KPI:', error);
    process.exit(1);
  }
}

updateSprintKPI();
