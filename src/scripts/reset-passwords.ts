import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

const resetPasswords = async () => {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);

    // Hash new password "1"
    const newPassword = '1';
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update all users
    const result = await userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password_hash: passwordHash })
      .execute();

    console.log(`✅ Updated ${result.affected} users`);
    console.log(`🔑 New password for all users: "${newPassword}"`);

    // List all users
    const users = await userRepository.find({
      select: ['id', 'email', 'full_name', 'role'],
    });

    console.log('\n📋 Users list:');
    users.forEach((user) => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    console.log('\n✅ Password reset completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetPasswords();
