import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';
import { Task } from '../models/Task';
import { Sprint } from '../models/Sprint';
import { Milestone } from '../models/Milestone';
import bcrypt from 'bcrypt';

export async function seedAll() {
  const userRepo = AppDataSource.getRepository(User);
  const teamRepo = AppDataSource.getRepository(Team);
  const teamMemberRepo = AppDataSource.getRepository(TeamMember);
  const taskRepo = AppDataSource.getRepository(Task);
  const sprintRepo = AppDataSource.getRepository(Sprint);
  const milestoneRepo = AppDataSource.getRepository(Milestone);

  // Check if data already exists
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    console.log('⚠️  Data already exists, skipping...');
    return;
  }

  console.log('Creating users...');

  // 1. Create users
  const password = await bcrypt.hash('1', 12);
  const admin = userRepo.create({
    email: 'admin@gmail.com',
    password_hash: password,
    full_name: 'Admin User',
    role: 'admin',
    ai_score: 100,
  });
  await userRepo.save(admin);

  const users = [];
  const userNames = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eve Martinez'];
  for (let i = 0; i < 5; i++) {
    const user = userRepo.create({
      email: `user${i + 1}@gmail.com`,
      password_hash: password,
      full_name: userNames[i],
      role: 'member',
      ai_score: 70 + Math.floor(Math.random() * 30),
    });
    users.push(user);
  }
  await userRepo.save(users);
  console.log('✅ Users created');

  // 2. Create team
  const team = teamRepo.create({
    name: 'Development Team',
    description: 'Main development team',
    owner_id: admin.id,
  });
  await teamRepo.save(team);
  console.log('✅ Team created');

  // 3. Create team members (including admin as owner)
  const teamMembers = [];
  
  // Add admin as owner
  const adminMember = teamMemberRepo.create({
    user_id: admin.id,
    team_id: team.id,
    role: 'owner',
    allocation_percentage: 100,
  });
  teamMembers.push(adminMember);
  
  // Add other users
  const roles = ['developer', 'designer', 'developer', 'qa', 'developer'];
  for (let i = 0; i < users.length; i++) {
    const member = teamMemberRepo.create({
      user_id: users[i].id,
      team_id: team.id,
      role: roles[i],
      allocation_percentage: 80 + Math.floor(Math.random() * 20),
    });
    teamMembers.push(member);
  }
  await teamMemberRepo.save(teamMembers);
  console.log('✅ Team members created (including admin)');

  // 4. Create sprint
  const sprint = sprintRepo.create({
    name: 'Sprint 1 - March 2026',
    team_id: team.id,
    start_date: new Date('2026-03-01'),
    end_date: new Date('2026-03-14'),
    status: 'active',
  });
  await sprintRepo.save(sprint);
  console.log('✅ Sprint created');

  // 5. Create milestones
  const milestones = [
    { title: 'MVP Release', due_date: new Date('2026-03-07'), is_completed: true, progress: 100 },
    { title: 'Beta Testing', due_date: new Date('2026-03-10'), is_completed: false, progress: 60 },
    { title: 'Production Deploy', due_date: new Date('2026-03-14'), is_completed: false, progress: 0 },
    { title: 'Post-Launch Review', due_date: new Date('2026-03-17'), is_completed: false, progress: 0 },
  ];

  for (const m of milestones) {
    const milestone = milestoneRepo.create({
      ...m,
      sprint_id: sprint.id,
    });
    await milestoneRepo.save(milestone);
  }
  console.log('✅ Milestones created');

  // 6. Create tasks
  const taskData = [
    { title: 'Design new dashboard UI', status: 'done', priority: 'high', hours: 16, tags: ['design', 'ui'] },
    { title: 'Implement user authentication', status: 'done', priority: 'high', hours: 24, tags: ['backend', 'security'] },
    { title: 'Setup CI/CD pipeline', status: 'in_progress', priority: 'high', hours: 12, tags: ['devops'] },
    { title: 'Write API documentation', status: 'in_progress', priority: 'medium', hours: 8, tags: ['docs'] },
    { title: 'Add unit tests', status: 'in_progress', priority: 'medium', hours: 20, tags: ['testing'] },
    { title: 'Optimize database queries', status: 'backlog', priority: 'medium', hours: 10, tags: ['backend', 'performance'] },
    { title: 'Create mobile responsive design', status: 'backlog', priority: 'high', hours: 16, tags: ['frontend', 'mobile'] },
    { title: 'Implement real-time notifications', status: 'backlog', priority: 'low', hours: 14, tags: ['backend', 'websocket'] },
    { title: 'Add dark mode support', status: 'backlog', priority: 'low', hours: 8, tags: ['frontend', 'ui'] },
    { title: 'Setup monitoring and logging', status: 'backlog', priority: 'medium', hours: 12, tags: ['devops', 'monitoring'] },
  ];

  const tasks = [];
  for (let i = 0; i < taskData.length; i++) {
    const data = taskData[i];
    const task = taskRepo.create({
      title: data.title,
      description: `Task description for: ${data.title}`,
      status: data.status,
      priority: data.priority,
      assignee_id: users[i % users.length].id,
      creator_id: admin.id,
      team_id: team.id,
      sprint_id: sprint.id,
      estimated_hours: data.hours,
      actual_hours: data.status === 'done' ? data.hours * 0.9 : null,
      tags: data.tags,
      deadline: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
    });
    tasks.push(task);
  }
  await taskRepo.save(tasks);
  console.log(`✅ ${tasks.length} tasks created`);

  console.log('\n🎉 All data seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('Email: admin@gmail.com');
  console.log('Password: 1');
}
