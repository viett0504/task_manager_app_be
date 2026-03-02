import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { Task } from '../models/Task';
import { Sprint } from '../models/Sprint';
import { TeamMember } from '../models/TeamMember';
import { LessThan, MoreThan, Between } from 'typeorm';

export class DashboardController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const taskRepository = AppDataSource.getRepository(Task);
      const sprintRepository = AppDataSource.getRepository(Sprint);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Get user's teams
      const userTeams = await teamMemberRepository.find({
        where: { user_id: userId },
        relations: ['team'],
      });
      const teamIds = userTeams.map(tm => tm.team_id);

      // Get tasks stats
      const now = new Date();
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      const [totalTasks, overdueTasks, soonTasks] = await Promise.all([
        taskRepository.count({
          where: teamIds.length > 0 ? teamIds.map(id => ({ team_id: id })) : {},
        }),
        taskRepository.count({
          where: teamIds.length > 0 
            ? teamIds.map(id => ({ 
                team_id: id, 
                deadline: LessThan(now),
                status: 'todo' as any,
              }))
            : { deadline: LessThan(now), status: 'todo' as any },
        }),
        taskRepository.count({
          where: teamIds.length > 0
            ? teamIds.map(id => ({
                team_id: id,
                deadline: Between(now, twoDaysFromNow),
                status: 'todo' as any,
              }))
            : { deadline: Between(now, twoDaysFromNow), status: 'todo' as any },
        }),
      ]);

      // Get active sprint
      const activeSprint = await sprintRepository.findOne({
        where: { status: 'active' as any },
        order: { start_date: 'DESC' },
      });

      let sprintData = null;
      if (activeSprint) {
        const sprintTasks = await taskRepository.find({
          where: { sprint_id: activeSprint.id },
        });
        const completedTasks = sprintTasks.filter(t => t.status === 'done').length;
        const progress = sprintTasks.length > 0 
          ? Math.round((completedTasks / sprintTasks.length) * 100)
          : 0;
        
        const endDate = new Date(activeSprint.end_date);
        const daysRemaining = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        sprintData = {
          id: activeSprint.id,
          name: activeSprint.name,
          progress,
          daysRemaining: Math.max(0, daysRemaining),
          startDate: activeSprint.start_date,
          endDate: activeSprint.end_date,
        };
      }

      // Get team members allocation
      const teamMembers = await teamMemberRepository.find({
        where: teamIds.length > 0 ? teamIds.map(id => ({ team_id: id })) : {},
        relations: ['user'],
      });

      const membersWithAllocation = await Promise.all(
        teamMembers.map(async (member) => {
          const memberTasks = await taskRepository.count({
            where: { 
              assignee_id: member.user_id,
              status: 'in_progress' as any,
            },
          });
          
          return {
            id: member.user_id,
            name: member.user.full_name,
            email: member.user.email,
            role: member.role,
            allocation: Math.min(100, memberTasks * 15), // Simple calculation
          };
        })
      );

      res.json({
        success: true,
        data: {
          stats: {
            totalTasks,
            overdueTasks,
            soonTasks,
          },
          sprint: sprintData,
          teamMembers: membersWithAllocation,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAIInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const taskRepository = AppDataSource.getRepository(Task);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Get user's teams
      const userTeams = await teamMemberRepository.find({
        where: { user_id: userId },
      });
      const teamIds = userTeams.map(tm => tm.team_id);

      const insights = [];

      // Check for overdue tasks
      const overdueTasks = await taskRepository.count({
        where: teamIds.length > 0
          ? teamIds.map(id => ({
              team_id: id,
              deadline: LessThan(new Date()),
              status: 'todo' as any,
            }))
          : { deadline: LessThan(new Date()), status: 'todo' as any },
      });

      if (overdueTasks > 0) {
        insights.push({
          type: 'critical',
          title: 'Critical Warning',
          description: `${overdueTasks} task${overdueTasks > 1 ? 's are' : ' is'} overdue and need immediate attention.`,
          icon: 'warning',
        });
      }

      // Check for overloaded members
      const teamMembers = await teamMemberRepository.find({
        where: teamIds.length > 0 ? teamIds.map(id => ({ team_id: id })) : {},
        relations: ['user'],
      });

      for (const member of teamMembers) {
        const activeTasks = await taskRepository.count({
          where: {
            assignee_id: member.user_id,
            status: 'in_progress' as any,
          },
        });

        if (activeTasks > 5) {
          insights.push({
            type: 'info',
            title: 'Workload Alert',
            description: `${member.user.full_name} has ${activeTasks} active tasks. Consider redistributing workload.`,
            icon: 'people',
          });
        }
      }

      res.json({
        success: true,
        data: { insights },
      });
    } catch (error) {
      next(error);
    }
  }
}
