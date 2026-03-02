import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { Task } from '../models/Task';
import { Sprint } from '../models/Sprint';

async function seedTasks() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const teamRepo = AppDataSource.getRepository(Team);
    const taskRepo = AppDataSource.getRepository(Task);
    const sprintRepo = AppDataSource.getRepository(Sprint);

    // Get existing users and team
    const users = await userRepo.find();
    const team = await teamRepo.findOne({ where: {} });

    if (!team || users.length === 0) {
      console.log('❌ Please run seed script first to create users and team');
      process.exit(1);
    }

    console.log(`Found ${users.length} users and team: ${team.name}`);

    // Create a sprint
    const sprint = sprintRepo.create({
      name: 'Sprint 1 - March 2026',
      team_id: team.id,
      start_date: new Date('2026-03-01'),
      end_date: new Date('2026-03-14'),
      status: 'active',
    });
    await sprintRepo.save(sprint);
    console.log('✅ Sprint created');

    // Sample tasks
    const taskData = [
      {
        title: 'Design new dashboard UI',
        description: 'Create mockups for the new dashboard with improved UX',
        status: 'in_progress',
        priority: 'high',
        assignee_id: users[0].id,
        estimated_hours: 16,
        tags: ['design', 'ui', 'dashboard'],
      },
      {
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication with refresh tokens',
        status: 'done',
        priority: 'high',
        assignee_id: users[1].id,
        estimated_hours: 24,
        actual_hours: 20,
        tags: ['backend', 'security', 'auth'],
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'backlog',
        priority: 'medium',
        assignee_id: users[2].id,
        estimated_hours: 12,
        tags: ['devops', 'ci-cd'],
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints with examples',
        status: 'backlog',
        priority: 'low',
        estimated_hours: 8,
        tags: ['documentation', 'api'],
      },
      {
        title: 'Fix mobile responsive issues',
        description: 'Resolve layout problems on mobile devices',
        status: 'in_progress',
        priority: 'high',
        assignee_id: users[3].id,
        estimated_hours: 10,
        tags: ['frontend', 'mobile', 'bug'],
      },
      {
        title: 'Optimize database queries',
        description: 'Improve performance of slow queries',
        status: 'backlog',
        priority: 'medium',
        assignee_id: users[4].id,
        estimated_hours: 16,
        tags: ['backend', 'database', 'performance'],
      },
      {
        title: 'Add unit tests for auth module',
        description: 'Write comprehensive tests for authentication logic',
        status: 'done',
        priority: 'medium',
        assignee_id: users[1].id,
        estimated_hours: 12,
        actual_hours: 14,
        tags: ['testing', 'backend'],
      },
      {
        title: 'Create user profile page',
        description: 'Build profile page with edit functionality',
        status: 'in_progress',
        priority: 'medium',
        assignee_id: users[0].id,
        estimated_hours: 20,
        tags: ['frontend', 'profile'],
      },
      {
        title: 'Implement real-time notifications',
        description: 'Add WebSocket support for live notifications',
        status: 'backlog',
        priority: 'low',
        assignee_id: users[2].id,
        estimated_hours: 24,
        tags: ['backend', 'websocket', 'notifications'],
      },
      {
        title: 'Setup error monitoring',
        description: 'Integrate Sentry for error tracking',
        status: 'backlog',
        priority: 'medium',
        estimated_hours: 6,
        tags: ['devops', 'monitoring'],
      },
      {
        title: 'Design team collaboration features',
        description: 'Plan features for team chat and file sharing',
        status: 'backlog',
        priority: 'low',
        estimated_hours: 8,
        tags: ['design', 'collaboration'],
      },
      {
        title: 'Refactor task management code',
        description: 'Clean up and optimize task-related components',
        status: 'done',
        priority: 'medium',
        assignee_id: users[3].id,
        estimated_hours: 10,
        actual_hours: 12,
        tags: ['refactoring', 'frontend'],
      },
    ];

    // Create tasks
    const tasks = [];
    for (const data of taskData) {
      const task = taskRepo.create({
        ...data,
        creator_id: users[0].id,
        team_id: team.id,
        sprint_id: sprint.id,
        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random deadline within 30 days
      });
      tasks.push(task);
    }

    await taskRepo.save(tasks);
    console.log(`✅ Created ${tasks.length} tasks`);

    // Summary
    const backlogCount = tasks.filter(t => t.status === 'backlog').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    console.log('\n📊 Task Summary:');
    console.log(`   Backlog: ${backlogCount}`);
    console.log(`   In Progress: ${inProgressCount}`);
    console.log(`   Done: ${doneCount}`);
    console.log(`   Total: ${tasks.length}`);

    console.log('\n🎉 Task seeding completed!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Task seeding failed:', error);
    process.exit(1);
  }
}

seedTasks();
