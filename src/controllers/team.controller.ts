import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/database';
import { Team } from '../models/Team';
import { TeamMember } from '../models/TeamMember';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { AppError } from '../utils/AppError';

export class TeamController {
  async getTeams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);
      const teamRepository = AppDataSource.getRepository(Team);

      // Get teams where user is a member
      const memberships = await teamMemberRepository.find({
        where: { user_id: userId },
        relations: ['team'],
      });

      const teams = memberships.map(m => m.team);

      res.json({
        success: true,
        data: { teams },
      });
    } catch (error) {
      next(error);
    }
  }

  async createTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, description } = req.body;

      if (!name) {
        throw new AppError('Team name is required', 400, 'VALIDATION_ERROR');
      }

      const teamRepository = AppDataSource.getRepository(Team);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Create team
      const team = teamRepository.create({
        name,
        description,
        owner_id: userId,
      });

      await teamRepository.save(team);

      // Add creator as owner member
      const member = teamMemberRepository.create({
        team_id: team.id,
        user_id: userId,
        role: 'owner',
        allocation_percentage: 100,
      });

      await teamMemberRepository.save(member);

      res.status(201).json({
        success: true,
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const teamRepository = AppDataSource.getRepository(Team);
      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Check if user is member
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: id },
      });

      if (!membership) {
        throw new AppError('You are not a member of this team', 403, 'FORBIDDEN');
      }

      const team = await teamRepository.findOne({
        where: { id },
      });

      if (!team) {
        throw new AppError('Team not found', 404, 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Check if user is member
      const userMembership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: id },
      });

      if (!userMembership) {
        throw new AppError('You are not a member of this team', 403, 'FORBIDDEN');
      }

      // Get all members with user info
      const members = await teamMemberRepository.find({
        where: { team_id: id },
        relations: ['user'],
      });

      // Transform to include basic user info only
      const transformedMembers = members.map(member => ({
        id: member.id,
        role: member.role,
        allocation_percentage: member.allocation_percentage,
        ai_score: member.user.ai_score,
        is_online: member.user.is_active, // Using is_active as online status
        user: {
          id: member.user.id,
          full_name: member.user.full_name,
          email: member.user.email,
          avatar_url: member.user.avatar_url,
        },
      }));

      res.json({
        success: true,
        data: { members: transformedMembers },
      });
    } catch (error) {
      next(error);
    }
  }

  async addTeamMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { email, user_id, role = 'member', allocation_percentage = 100 } = req.body;

      // Must provide either email or user_id
      if (!email && !user_id) {
        throw new AppError('Email or User ID is required', 400, 'VALIDATION_ERROR');
      }

      const teamMemberRepository = AppDataSource.getRepository(TeamMember);
      const userRepository = AppDataSource.getRepository(User);

      // Check if requester is admin or owner
      const requesterMembership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: id },
      });

      if (!requesterMembership || (requesterMembership.role !== 'admin' && requesterMembership.role !== 'owner')) {
        throw new AppError('You do not have permission to add members', 403, 'FORBIDDEN');
      }

      // Find user by email or user_id
      let user;
      if (email) {
        user = await userRepository.findOne({ where: { email } });
        if (!user) {
          throw new AppError('User with this email not found', 404, 'NOT_FOUND');
        }
      } else {
        user = await userRepository.findOne({ where: { id: user_id } });
        if (!user) {
          throw new AppError('User not found', 404, 'NOT_FOUND');
        }
      }

      // Check if already a member
      const existingMember = await teamMemberRepository.findOne({
        where: { user_id: user.id, team_id: id },
      });

      if (existingMember) {
        throw new AppError('User is already a member', 400, 'ALREADY_EXISTS');
      }

      // Add member
      const member = teamMemberRepository.create({
        team_id: id,
        user_id: user.id,
        role,
        allocation_percentage,
      });

      await teamMemberRepository.save(member);

      // Load member with user info
      const savedMember = await teamMemberRepository.findOne({
        where: { id: member.id },
        relations: ['user'],
      });

      res.status(201).json({
        success: true,
        data: { 
          member: {
            id: savedMember!.id,
            role: savedMember!.role,
            allocation_percentage: savedMember!.allocation_percentage,
            ai_score: savedMember!.user.ai_score,
            is_online: savedMember!.user.is_active,
            user: {
              id: savedMember!.user.id,
              full_name: savedMember!.user.full_name,
              email: savedMember!.user.email,
              avatar_url: savedMember!.user.avatar_url,
            },
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeTeamMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params;
      const userId = req.user!.id;

      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Check if requester is admin or owner
      const requesterMembership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: id },
      });

      if (!requesterMembership || (requesterMembership.role !== 'admin' && requesterMembership.role !== 'owner')) {
        throw new AppError('You do not have permission to remove members', 403, 'FORBIDDEN');
      }

      const member = await teamMemberRepository.findOne({
        where: { id: memberId, team_id: id },
      });

      if (!member) {
        throw new AppError('Member not found', 404, 'NOT_FOUND');
      }

      // Cannot remove owner
      if (member.role === 'owner') {
        throw new AppError('Cannot remove team owner', 400, 'INVALID_OPERATION');
      }

      await teamMemberRepository.remove(member);

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getActivityLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { limit = 50 } = req.query;

      const teamMemberRepository = AppDataSource.getRepository(TeamMember);
      const activityLogRepository = AppDataSource.getRepository(ActivityLog);

      // Check if user is member
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: id },
      });

      if (!membership) {
        throw new AppError('You are not a member of this team', 403, 'FORBIDDEN');
      }

      // Get activity logs
      const logs = await activityLogRepository.find({
        where: { team_id: id },
        relations: ['user'],
        order: { created_at: 'DESC' },
        take: Number(limit),
      });

      // Transform to include basic user info
      const transformedLogs = logs.map(log => ({
        id: log.id,
        action_type: log.action_type,
        action_description: log.action_description,
        target_type: log.target_type,
        target_id: log.target_id,
        metadata: log.metadata,
        created_at: log.created_at,
        user: {
          id: log.user.id,
          full_name: log.user.full_name,
          email: log.user.email,
        },
      }));

      res.json({
        success: true,
        data: { logs: transformedLogs },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamKPI(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const teamMemberRepository = AppDataSource.getRepository(TeamMember);

      // Check if user is member
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: id },
      });

      if (!membership) {
        throw new AppError('You are not a member of this team', 403, 'FORBIDDEN');
      }

      // Get team members with AI scores
      const members = await teamMemberRepository.find({
        where: { team_id: id },
        relations: ['user'],
      });

      const totalMembers = members.length;
      const avgAiScore = members.reduce((sum, m) => sum + (m.user.ai_score || 0), 0) / totalMembers;
      const avgAllocation = members.reduce((sum, m) => sum + m.allocation_percentage, 0) / totalMembers;

      res.json({
        success: true,
        data: {
          kpi: {
            total_members: totalMembers,
            avg_ai_score: Math.round(avgAiScore),
            avg_allocation: Math.round(avgAllocation),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const teamMemberRepository = AppDataSource.getRepository(TeamMember);
      const userRepository = AppDataSource.getRepository(User);

      // Check if user is member
      const membership = await teamMemberRepository.findOne({
        where: { user_id: userId, team_id: id },
      });

      if (!membership) {
        throw new AppError('You are not a member of this team', 403, 'FORBIDDEN');
      }

      // Get all users
      const allUsers = await userRepository.find({
        select: ['id', 'full_name', 'email', 'avatar_url'],
      });

      // Get current team members
      const teamMembers = await teamMemberRepository.find({
        where: { team_id: id },
        select: ['user_id'],
      });

      const teamMemberIds = teamMembers.map(m => m.user_id);

      // Filter out users who are already members
      const availableUsers = allUsers.filter(user => !teamMemberIds.includes(user.id));

      res.json({
        success: true,
        data: {
          users: availableUsers.map(user => ({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            avatar_url: user.avatar_url,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
