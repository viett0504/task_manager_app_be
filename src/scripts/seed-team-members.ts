import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';

async function seedTeamMembers() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const teamRepo = AppDataSource.getRepository(Team);
    const teamMemberRepo = AppDataSource.getRepository(TeamMember);

    // Get existing users and team
    const users = await userRepo.find();
    const team = await teamRepo.findOne({ where: {} });

    if (!team || users.length === 0) {
      console.log('❌ Please run seed script first to create users and team');
      process.exit(1);
    }

    console.log(`Found ${users.length} users and team: ${team.name}`);

    // Check if team members already exist
    const existingMembers = await teamMemberRepo.find({
      where: { team_id: team.id },
    });

    if (existingMembers.length > 0) {
      console.log(`⚠️  Team already has ${existingMembers.length} members`);
      console.log('Clearing existing members...');
      await teamMemberRepo.remove(existingMembers);
    }

    // Add all users as team members
    const members = [];
    
    // First user (admin) as owner
    const owner = teamMemberRepo.create({
      team_id: team.id,
      user_id: users[0].id,
      role: 'owner',
      allocation_percentage: 100,
    });
    members.push(owner);

    // Second user as admin
    if (users.length > 1) {
      const admin = teamMemberRepo.create({
        team_id: team.id,
        user_id: users[1].id,
        role: 'admin',
        allocation_percentage: 100,
      });
      members.push(admin);
    }

    // Rest as members with varying allocations
    const allocations = [100, 80, 75, 60];
    for (let i = 2; i < users.length; i++) {
      const member = teamMemberRepo.create({
        team_id: team.id,
        user_id: users[i].id,
        role: 'member',
        allocation_percentage: allocations[i - 2] || 100,
      });
      members.push(member);
    }

    await teamMemberRepo.save(members);
    console.log(`✅ Added ${members.length} team members`);

    // Display summary
    console.log('\n👥 Team Members:');
    const savedMembers = await teamMemberRepo.find({
      where: { team_id: team.id },
      relations: ['user'],
    });

    savedMembers.forEach((member) => {
      console.log(`   - ${member.user.full_name} (${member.user.email})`);
      console.log(`     Role: ${member.role}, Allocation: ${member.allocation_percentage}%, AI Score: ${member.user.ai_score}`);
    });

    console.log('\n🎉 Team members seeding completed!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Team members seeding failed:', error);
    process.exit(1);
  }
}

seedTeamMembers();
