import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { Sprint } from '../models/Sprint';
import { Task } from '../models/Task';
import { TeamMember } from '../models/TeamMember';
import { AppError } from '../utils/AppError';

export class SprintController {
  async getSprints(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { team_id, status } = req.query;

      const sprintRepository = AppDataSource.getRepository(Sprint);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Get user's teams
      const userTeams = await teamMemberRepository.find({
        where: { user_id: userId },
      });
      const teamIds = userTeams.map(tm => tm.team_id);

      // Build query
      const queryBuilder = sprintRepository
        .createQueryBuilder('sprint')
        .leftJoinAndSelect('sprint.team', 'team');

      // Filter by team
      if (team_id) {
        queryBuilder.andWhere('sprint.team_id = :teamId', { teamId: team_id });
      } else if (teamIds.length > 0) {
        queryBuilder.andWhere('sprint.team_id IN (:...teamIds)', { teamIds });
      }

      // Filter by status
      if (status) {
        queryBuilder.andWhere('sprint.status = :status', { status });
      }

      queryBuilder.orderBy('sprint.start_date', 'DESC');

      const sprints = await queryBuilder.getMany();

      // Get task counts for each sprint
      const taskRepository = AppDataSource.getRepository(Task);
      const sprintsWithTasks = await Promise.all(
        sprints.map(async (sprint) => {
          const tasks = await taskRepository.find({
            where: { sprint_id: sprint.id },
          });

          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(t => t.status === 'done').length;
          const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

          return {
            ...sprint,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            in_progress_tasks: inProgressTasks,
          };
        })
      );

      res.json({
        success: true,
        data: { sprints: sprintsWithTasks },
      });
    } catch (error) {
      next(error);
    }
  }

  async createSprint(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, team_id, start_date, end_date, status = 'planning' } = req.body;

      if (!name || !team_id || !start_date || !end_date) {
        throw new AppError('Name, team_id, start_date, and end_date are required', 400, 'VALIDATION_ERROR');
      }

      const sprintRepository = AppDataSource.getRepository(Sprint);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Check if user is member of the team
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id },
      });

      if (!membership) {
        throw new AppError('You are not a member of this team', 403, 'FORBIDDEN');
      }

      const sprint = sprintRepository.create({
        name,
        team_id,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status,
      });

      await sprintRepository.save(sprint);

      res.status(201).json({
        success: true,
        data: { sprint },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSprintById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const sprintRepository = AppDataSource.getRepository(Sprint);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);
      const taskRepository = AppDataSource.getRepository(Task);

      const sprint = await sprintRepository.findOne({
        where: { id },
        relations: ['team', 'milestones'],
      });

      if (!sprint) {
        throw new AppError('Sprint not found', 404, 'NOT_FOUND');
      }

      // Check if user has access
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: sprint.team_id },
      });

      if (!membership) {
        throw new AppError('You do not have access to this sprint', 403, 'FORBIDDEN');
      }

      // Get tasks
      const tasks = await taskRepository.find({
        where: { sprint_id: id },
        relations: ['assignee'],
      });

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

      res.json({
        success: true,
        data: {
          sprint: {
            ...sprint,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            in_progress_tasks: inProgressTasks,
            milestones: sprint.milestones || [],
            tasks: tasks.map(t => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              assignee: t.assignee ? {
                id: t.assignee.id,
                full_name: t.assignee.full_name,
                email: t.assignee.email,
              } : null,
            })),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSprint(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updates = req.body;

      const sprintRepository = AppDataSource.getRepository(Sprint);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      const sprint = await sprintRepository.findOne({ where: { id } });

      if (!sprint) {
        throw new AppError('Sprint not found', 404, 'NOT_FOUND');
      }

      // Check if user has access
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: sprint.team_id },
      });

      if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
        throw new AppError('You do not have permission to update this sprint', 403, 'FORBIDDEN');
      }

      // Update fields
      if (updates.name !== undefined) sprint.name = updates.name;
      if (updates.status !== undefined) sprint.status = updates.status;
      if (updates.start_date !== undefined) sprint.start_date = new Date(updates.start_date);
      if (updates.end_date !== undefined) sprint.end_date = new Date(updates.end_date);

      await sprintRepository.save(sprint);

      res.json({
        success: true,
        data: { sprint },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSprint(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const sprintRepository = AppDataSource.getRepository(Sprint);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      const sprint = await sprintRepository.findOne({ where: { id } });

      if (!sprint) {
        throw new AppError('Sprint not found', 404, 'NOT_FOUND');
      }

      // Check if user has access
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: sprint.team_id },
      });

      if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
        throw new AppError('You do not have permission to delete this sprint', 403, 'FORBIDDEN');
      }

      await sprintRepository.remove(sprint);

      res.json({
        success: true,
        message: 'Sprint deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addMilestone(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.status(201).json({ success: true, message: 'Add milestone - to be implemented' });
    } catch (error) {
      next(error);
    }
  }

  async getBurndownData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const sprintRepository = AppDataSource.getRepository(Sprint);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);
      const taskRepository = AppDataSource.getRepository(Task);

      const sprint = await sprintRepository.findOne({ where: { id } });

      if (!sprint) {
        throw new AppError('Sprint not found', 404, 'NOT_FOUND');
      }

      // Check if user has access
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: sprint.team_id },
      });

      if (!membership) {
        throw new AppError('You do not have access to this sprint', 403, 'FORBIDDEN');
      }

      // Get all tasks in sprint
      const tasks = await taskRepository.find({
        where: { sprint_id: id },
      });

      const totalTasks = tasks.length;
      const startDate = new Date(sprint.start_date);
      const endDate = new Date(sprint.end_date);
      const now = new Date();

      // Calculate burndown data points
      const burndownData = [];
      const dayInMs = 24 * 60 * 60 * 1000;
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / dayInMs);

      // Ideal burndown (linear)
      for (let i = 0; i <= totalDays; i++) {
        const currentDate = new Date(startDate.getTime() + i * dayInMs);
        const idealRemaining = totalTasks - (totalTasks * i / totalDays);

        // Calculate actual remaining (tasks not done by this date)
        // For simplicity, we'll use current completion rate
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const daysElapsed = Math.min(i, Math.ceil((now.getTime() - startDate.getTime()) / dayInMs));
        const actualRemaining = daysElapsed > 0 
          ? Math.max(0, totalTasks - (completedTasks * i / daysElapsed))
          : totalTasks;

        burndownData.push({
          date: currentDate.toISOString().split('T')[0],
          ideal: Math.round(idealRemaining * 10) / 10,
          actual: i <= daysElapsed ? Math.round(actualRemaining * 10) / 10 : null,
        });
      }

      // AI Insight based on current progress
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / dayInMs);
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / dayInMs));
      const expectedProgress = daysElapsed / totalDays;
      const actualProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;

      let probability = 85;
      let status = 'on_track';
      let message = 'Sprint is progressing well and on track for completion.';

      if (actualProgress < expectedProgress - 0.2) {
        probability = 45;
        status = 'at_risk';
        message = 'Sprint is behind schedule. Consider reallocating resources or reducing scope.';
      } else if (actualProgress < expectedProgress - 0.1) {
        probability = 65;
        status = 'needs_attention';
        message = 'Sprint is slightly behind. Monitor progress closely.';
      } else if (actualProgress > expectedProgress + 0.1) {
        probability = 95;
        status = 'ahead';
        message = 'Sprint is ahead of schedule. Great work!';
      }

      const aiInsight = {
        type: status,
        probability,
        message,
        recommendations: [
          actualProgress < expectedProgress 
            ? 'Focus on high-priority tasks'
            : 'Maintain current velocity',
          daysRemaining < 3 
            ? 'Prepare for sprint review'
            : 'Continue daily standups',
        ],
      };

      res.json({
        success: true,
        data: {
          burndown: burndownData,
          insight: aiInsight,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
