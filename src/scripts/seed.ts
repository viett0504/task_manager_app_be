import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Team } from '../models/Team';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const teamRepo = AppDataSource.getRepository(Team);

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = userRepo.create({
      email: 'admin@taskflow.ai',
      password_hash: adminPassword,
      full_name: 'Admin User',
      role: 'admin',
      ai_score: 100,
    });
    await userRepo.save(admin);
    console.log('✅ Admin user created');

    // Create test users
    const testPassword = await bcrypt.hash('Test123!', 12);
    const users = [];
    
    for (let i = 1; i <= 5; i++) {
      const user = userRepo.create({
        email: `user${i}@taskflow.ai`,
        password_hash: testPassword,
        full_name: `Test User ${i}`,
        role: 'member',
        ai_score: Math.floor(Math.random() * 100),
      });
      users.push(user);
    }
    await userRepo.save(users);
    console.log('✅ Test users created');

    // Create test team
    const team = teamRepo.create({
      name: 'Development Team',
      description: 'Main development team',
      owner_id: admin.id,
    });
    await teamRepo.save(team);
    console.log('✅ Test team created');

    console.log('\n🎉 Seeding completed!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@taskflow.ai / Admin123!');
    console.log('User: user1@taskflow.ai / Test123!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
