import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from './Task';
import { TeamMember } from './TeamMember';
import { ActivityLog } from './ActivityLog';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password_hash: string;

  @Column({ length: 255 })
  full_name: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ length: 50, default: 'member' })
  role: string; // 'admin', 'member', 'viewer'

  @Column({ type: 'int', default: 0 })
  ai_score: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Task, (task) => task.assignee)
  assigned_tasks: Task[];

  @OneToMany(() => Task, (task) => task.creator)
  created_tasks: Task[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  team_memberships: TeamMember[];

  @OneToMany(() => ActivityLog, (log) => log.user)
  activity_logs: ActivityLog[];
}
