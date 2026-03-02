import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { Task } from '../models/Task';
import { Sprint } from '../models/Sprint';

async function seedMoreTasks() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const teamRepo = AppDataSource.getRepository(Team);
    const taskRepo = AppDataSource.getRepository(Task);
    const sprintRepo = AppDataSource.getRepository(Sprint);

    // Get existing data
    const users = await userRepo.find();
    const team = await teamRepo.findOne({ where: {} });
    const sprint = await sprintRepo.findOne({ where: { status: 'active' } });

    if (!team || users.length === 0 || !sprint) {
      console.log('❌ Please run seed script first');
      process.exit(1);
    }

    console.log(`Found ${users.length} users, team: ${team.name}, sprint: ${sprint.name}`);

    // More realistic tasks
    const taskData = [
      {
        title: 'Implement dark mode theme',
        description: 'Add dark mode support across all screens with smooth transitions. Include theme persistence and system preference detection.',
        status: 'in_progress',
        priority: 'high',
        assignee_id: users[0].id,
        estimated_hours: 20,
        actual_hours: 12,
        deadline: new Date('2026-03-08'),
        tags: ['frontend', 'ui', 'theme'],
      },
      {
        title: 'Add task filtering and search',
        description: 'Implement advanced filtering by status, priority, assignee, and tags. Add full-text search functionality.',
        status: 'backlog',
        priority: 'high',
        assignee_id: users[1].id,
        estimated_hours: 16,
        deadline: new Date('2026-03-10'),
        tags: ['frontend', 'search', 'filter'],
      },
      {
        title: 'Create sprint burndown chart',
        description: 'Visualize sprint progress with burndown chart showing ideal vs actual progress. Include velocity metrics.',
        status: 'done',
        priority: 'medium',
        assignee_id: users[2].id,
        estimated_hours: 14,
        actual_hours: 16,
        deadline: new Date('2026-03-05'),
        tags: ['frontend', 'charts', 'analytics'],
      },
      {
        title: 'Setup database backup automation',
        description: 'Configure automated daily backups with retention policy. Test restore procedures.',
        status: 'backlog',
        priority: 'high',
        assignee_id: users[3].id,
        estimated_hours: 8,
        deadline: new Date('2026-03-12'),
        tags: ['devops', 'database', 'backup'],
      },
      {
        title: 'Implement drag and drop for tasks',
        description: 'Add drag and drop functionality to move tasks between columns on the board view.',
        status: 'in_progress',
        priority: 'medium',
        assignee_id: users[0].id,
        estimated_hours: 18,
        actual_hours: 10,
        deadline: new Date('2026-03-09'),
        tags: ['frontend', 'ux', 'board'],
      },
      {
        title: 'Add email notifications',
        description: 'Send email notifications for task assignments, mentions, and deadline reminders.',
        status: 'backlog',
        priority: 'medium',
        assignee_id: users[4].id,
        estimated_hours: 20,
        deadline: new Date('2026-03-15'),
        tags: ['backend', 'email', 'notifications'],
      },
      {
        title: 'Create team analytics dashboard',
        description: 'Build analytics page showing team productivity, task completion rates, and velocity trends.',
        status: 'backlog',
        priority: 'low',
        assignee_id: users[2].id,
        estimated_hours: 24,
        deadline: new Date('2026-03-20'),
        tags: ['frontend', 'analytics', 'dashboard'],
      },
      {
        title: 'Implement task comments',
        description: 'Add commenting system for tasks with mentions, reactions, and file attachments.',
        status: 'in_progress',
        priority: 'high',
        assignee_id: users[1].id,
        estimated_hours: 22,
        actual_hours: 14,
        deadline: new Date('2026-03-11'),
        tags: ['frontend', 'backend', 'comments'],
      },
      {
        title: 'Add task time tracking',
        description: 'Implement time tracking feature with start/stop timer and manual time entry.',
        status: 'backlog',
        priority: 'medium',
        assignee_id: users[3].id,
        estimated_hours: 16,
        deadline: new Date('2026-03-13'),
        tags: ['frontend', 'backend', 'time-tracking'],
      },
      {
        title: 'Setup performance monitoring',
        description: 'Integrate performance monitoring tools to track API response times and frontend metrics.',
        status: 'backlog',
        priority: 'low',
        assignee_id: users[4].id,
        estimated_hours: 10,
        deadline: new Date('2026-03-18'),
        tags: ['devops', 'monitoring', 'performance'],
      },
      {
        title: 'Create mobile app prototype',
        description: 'Design and prototype mobile app version with core features.',
        status: 'backlog',
        priority: 'low',
        assignee_id: users[0].id,
        estimated_hours: 40,
        deadline: new Date('2026-03-25'),
        tags: ['mobile', 'design', 'prototype'],
      },
      {
        title: 'Implement task dependencies',
        description: 'Add ability to set task dependencies and visualize them in a dependency graph.',
        status: 'backlog',
        priority: 'medium',
        assignee_id: users[1].id,
        estimated_hours: 20,
        deadline: new Date('2026-03-16'),
        tags: ['frontend', 'backend', 'dependencies'],
      },
      {
        title: 'Add calendar view for tasks',
        description: 'Create calendar view showing tasks by deadline with drag-to-reschedule functionality.',
        status: 'done',
        priority: 'high',
        assignee_id: users[2].id,
        estimated_hours: 18,
        actual_hours: 20,
        deadline: new Date('2026-03-06'),
        tags: ['frontend', 'calendar', 'ui'],
      },
      {
        title: 'Implement role-based permissions',
        description: 'Add granular permissions system for different user roles (admin, member, viewer).',
        status: 'in_progress',
        priority: 'high',
        assignee_id: users[3].id,
        estimated_hours: 24,
        actual_hours: 16,
        deadline: new Date('2026-03-10'),
        tags: ['backend', 'security', 'permissions'],
      },
      {
        title: 'Create API rate limiting',
        description: 'Implement rate limiting to prevent API abuse and ensure fair usage.',
        status: 'backlog',
        priority: 'medium',
        assignee_id: users[4].id,
        estimated_hours: 8,
        deadline: new Date('2026-03-14'),
        tags: ['backend', 'security', 'api'],
      },
      {
        title: 'Add task templates',
        description: 'Create reusable task templates for common workflows and project types.',
        status: 'backlog',
        priority: 'low',
        assignee_id: users[0].id,
        estimated_hours: 12,
        deadline: new Date('2026-03-17'),
        tags: ['frontend', 'templates', 'productivity'],
      },
      {
        title: 'Implement file upload for tasks',
        description: 'Add file attachment support for tasks with preview and download functionality.',
        status: 'backlog',
        priority: 'medium',
        assignee_id: users[1].id,
        estimated_hours: 16,
        deadline: new Date('2026-03-15'),
        tags: ['frontend', 'backend', 'files'],
      },
      {
        title: 'Create sprint retrospective feature',
        description: 'Build retrospective board for teams to reflect on completed sprints.',
        status: 'backlog',
        priority: 'low',
        assignee_id: users[2].id,
        estimated_hours: 14,
        deadline: new Date('2026-03-22'),
        tags: ['frontend', 'agile', 'retrospective'],
      },
      {
        title: 'Add keyboard shortcuts',
        description: 'Implement keyboard shortcuts for common actions to improve productivity.',
        status: 'backlog',
        priority: 'low',
        assignee_id: users[3].id,
        estimated_hours: 10,
        deadline: new Date('2026-03-19'),
        tags: ['frontend', 'ux', 'shortcuts'],
      },
      {
        title: 'Setup automated testing',
        description: 'Configure end-to-end testing with Cypress and integration tests.',
        status: 'in_progress',
        priority: 'high',
        assignee_id: users[4].id,
        estimated_hours: 20,
        actual_hours: 12,
        deadline: new Date('2026-03-11'),
        tags: ['testing', 'qa', 'automation'],
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
      });
      tasks.push(task);
    }

    await taskRepo.save(tasks);
    console.log(`✅ Created ${tasks.length} additional tasks`);

    // Summary
    const allTasks = await taskRepo.find();
    const backlogCount = allTasks.filter(t => t.status === 'backlog').length;
    const inProgressCount = allTasks.filter(t => t.status === 'in_progress').length;
    const doneCount = allTasks.filter(t => t.status === 'done').length;

    console.log('\n📊 Total Task Summary:');
    console.log(`   Backlog: ${backlogCount}`);
    console.log(`   In Progress: ${inProgressCount}`);
    console.log(`   Done: ${doneCount}`);
    console.log(`   Total: ${allTasks.length}`);

    console.log('\n🎉 Additional task seeding completed!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Task seeding failed:', error);
    process.exit(1);
  }
}

seedMoreTasks();
