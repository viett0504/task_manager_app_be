import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Team } from '../models/Team';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  const userRepo = AppDataSource.getRepository(User);
  const teamRepo = AppDataSource.getRepository(Team);

  // Check if admin already exists
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@gmail.com' } });
  if (existingAdmin) {
    console.log('⚠️  Admin user already exists, skipping seed');
    return;
  }

  // Create admin user with password "1"
  const adminPassword = await bcrypt.hash('1', 12);
  const admin = userRepo.create({
    email: 'admin@gmail.com',
    password_hash: adminPassword,
    full_name: 'Admin User',
    role: 'admin',
    ai_score: 100,
  });
  await userRepo.save(admin);
  console.log('✅ Admin user created');

  // Create test users with password "1"
  const testPassword = await bcrypt.hash('1', 12);
  const users = [];
  
  for (let i = 1; i <= 5; i++) {
    const user = userRepo.create({
      email: `user${i}@gmail.com`,
      password_hash: testPassword,
      full_name: `User ${i}`,
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
  console.log('Admin: admin@gmail.com / 1');
  console.log('User: user1@gmail.com / 1');
}

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    await seedDatabase();

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  seed();
}
