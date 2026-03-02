import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { Task } from '../models/Task';
import { TeamMember } from '../models/TeamMember';
import { AppError } from '../utils/AppError';

export class TaskController {
  async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { team_id, sprint_id, status, assignee_id } = req.query;
      
      const taskRepository = AppDataSource.getRepository(Task);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Get user's teams
      const userTeams = await teamMemberRepository.find({
        where: { user_id: userId },
      });
      const teamIds = userTeams.map(tm => tm.team_id);

      // Build query
      const queryBuilder = taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .leftJoinAndSelect('task.creator', 'creator')
        .leftJoinAndSelect('task.team', 'team')
        .leftJoinAndSelect('task.sprint', 'sprint');

      // Filter by team
      if (team_id) {
        queryBuilder.andWhere('task.team_id = :teamId', { teamId: team_id });
      } else if (teamIds.length > 0) {
        queryBuilder.andWhere('task.team_id IN (:...teamIds)', { teamIds });
      }

      // Filter by sprint
      if (sprint_id) {
        queryBuilder.andWhere('task.sprint_id = :sprintId', { sprintId: sprint_id });
      }

      // Filter by status
      if (status) {
        queryBuilder.andWhere('task.status = :status', { status });
      }

      // Filter by assignee
      if (assignee_id) {
        queryBuilder.andWhere('task.assignee_id = :assigneeId', { assigneeId: assignee_id });
      }

      queryBuilder.orderBy('task.created_at', 'DESC');

      const tasks = await queryBuilder.getMany();

      // Transform tasks to only include basic user info
      const transformedTasks = tasks.map(task => ({
        ...task,
        assignee: task.assignee ? {
          id: task.assignee.id,
          full_name: task.assignee.full_name,
          email: task.assignee.email,
        } : null,
        creator: task.creator ? {
          id: task.creator.id,
          full_name: task.creator.full_name,
          email: task.creator.email,
        } : null,
      }));

      res.json({
        success: true,
        data: { tasks: transformedTasks },
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        title,
        description,
        status = 'backlog',
        priority = 'medium',
        assignee_id,
        team_id,
        sprint_id,
        deadline,
        estimated_hours,
        tags = [],
      } = req.body;

      if (!title || !team_id) {
        throw new AppError('Title and team_id are required', 400, 'VALIDATION_ERROR');
      }

      const taskRepository = AppDataSource.getRepository(Task);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Check if user is member of the team
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id },
      });

      if (!membership) {
        throw new AppError('You are not a member of this team', 403, 'FORBIDDEN');
      }

      const task = taskRepository.create({
        title,
        description,
        status,
        priority,
        assignee_id,
        creator_id: userId,
        team_id,
        sprint_id,
        deadline: deadline ? new Date(deadline) : null,
        estimated_hours,
        tags,
      });

      await taskRepository.save(task);

      // Load relations
      const createdTask = await taskRepository.findOne({
        where: { id: task.id },
        relations: ['assignee', 'creator', 'team', 'sprint'],
      });

      // Transform to only include basic user info
      const transformedTask = {
        ...createdTask,
        assignee: createdTask?.assignee ? {
          id: createdTask.assignee.id,
          full_name: createdTask.assignee.full_name,
          email: createdTask.assignee.email,
        } : null,
        creator: createdTask?.creator ? {
          id: createdTask.creator.id,
          full_name: createdTask.creator.full_name,
          email: createdTask.creator.email,
        } : null,
      };

      res.status(201).json({
        success: true,
        data: { task: transformedTask },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const taskRepository = AppDataSource.getRepository(Task);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      const task = await taskRepository.findOne({
        where: { id },
        relations: ['assignee', 'creator', 'team', 'sprint'],
      });

      if (!task) {
        throw new AppError('Task not found', 404, 'NOT_FOUND');
      }

      // Check if user has access to this task
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: task.team_id },
      });

      if (!membership) {
        throw new AppError('You do not have access to this task', 403, 'FORBIDDEN');
      }

      // Transform to only include basic user info
      const transformedTask = {
        ...task,
        assignee: task.assignee ? {
          id: task.assignee.id,
          full_name: task.assignee.full_name,
          email: task.assignee.email,
        } : null,
        creator: task.creator ? {
          id: task.creator.id,
          full_name: task.creator.full_name,
          email: task.creator.email,
        } : null,
      };

      res.json({
        success: true,
        data: { task: transformedTask },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updates = req.body;

      const taskRepository = AppDataSource.getRepository(Task);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      const task = await taskRepository.findOne({ where: { id } });

      if (!task) {
        throw new AppError('Task not found', 404, 'NOT_FOUND');
      }

      // Check if user has access
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: task.team_id },
      });

      if (!membership) {
        throw new AppError('You do not have access to this task', 403, 'FORBIDDEN');
      }

      // Update fields
      if (updates.title !== undefined) task.title = updates.title;
      if (updates.description !== undefined) task.description = updates.description;
      if (updates.status !== undefined) task.status = updates.status;
      if (updates.priority !== undefined) task.priority = updates.priority;
      if (updates.assignee_id !== undefined) task.assignee_id = updates.assignee_id;
      if (updates.sprint_id !== undefined) task.sprint_id = updates.sprint_id;
      if (updates.deadline !== undefined) task.deadline = updates.deadline ? new Date(updates.deadline) : null;
      if (updates.estimated_hours !== undefined) task.estimated_hours = updates.estimated_hours;
      if (updates.actual_hours !== undefined) task.actual_hours = updates.actual_hours;
      if (updates.tags !== undefined) task.tags = updates.tags;

      await taskRepository.save(task);

      // Load relations
      const updatedTask = await taskRepository.findOne({
        where: { id },
        relations: ['assignee', 'creator', 'team', 'sprint'],
      });

      // Transform to only include basic user info
      const transformedTask = {
        ...updatedTask,
        assignee: updatedTask?.assignee ? {
          id: updatedTask.assignee.id,
          full_name: updatedTask.assignee.full_name,
          email: updatedTask.assignee.email,
        } : null,
        creator: updatedTask?.creator ? {
          id: updatedTask.creator.id,
          full_name: updatedTask.creator.full_name,
          email: updatedTask.creator.email,
        } : null,
      };

      res.json({
        success: true,
        data: { task: transformedTask },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const taskRepository = AppDataSource.getRepository(Task);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      const task = await taskRepository.findOne({ where: { id } });

      if (!task) {
        throw new AppError('Task not found', 404, 'NOT_FOUND');
      }

      // Check if user has access
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: task.team_id },
      });

      if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
        throw new AppError('You do not have permission to delete this task', 403, 'FORBIDDEN');
      }

      await taskRepository.remove(task);

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTaskStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;

      if (!status) {
        throw new AppError('Status is required', 400, 'VALIDATION_ERROR');
      }

      const taskRepository = AppDataSource.getRepository(Task);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      const task = await taskRepository.findOne({ where: { id } });

      if (!task) {
        throw new AppError('Task not found', 404, 'NOT_FOUND');
      }

      // Check if user has access
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: task.team_id },
      });

      if (!membership) {
        throw new AppError('You do not have access to this task', 403, 'FORBIDDEN');
      }

      task.status = status;
      await taskRepository.save(task);

      // Load relations
      const updatedTask = await taskRepository.findOne({
        where: { id },
        relations: ['assignee', 'creator', 'team', 'sprint'],
      });

      // Transform to only include basic user info
      const transformedTask = {
        ...updatedTask,
        assignee: updatedTask?.assignee ? {
          id: updatedTask.assignee.id,
          full_name: updatedTask.assignee.full_name,
          email: updatedTask.assignee.email,
        } : null,
        creator: updatedTask?.creator ? {
          id: updatedTask.creator.id,
          full_name: updatedTask.creator.full_name,
          email: updatedTask.creator.email,
        } : null,
      };

      res.json({
        success: true,
        data: { task: transformedTask },
      });
    } catch (error) {
      next(error);
    }
  }
}
