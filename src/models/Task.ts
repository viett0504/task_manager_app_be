import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Team } from './Team';
import { Sprint } from './Sprint';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50 })
  status: string; // 'backlog', 'in_progress', 'done'

  @Column({ length: 50 })
  priority: string; // 'low', 'medium', 'high'

  @Column({ type: 'uuid', nullable: true })
  assignee_id: string;

  @Column({ type: 'uuid' })
  creator_id: string;

  @Column({ type: 'uuid' })
  team_id: string;

  @Column({ type: 'uuid', nullable: true })
  sprint_id: string;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  estimated_hours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  actual_hours: number;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.assigned_tasks)
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @ManyToOne(() => User, (user) => user.created_tasks)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => Team, (team) => team.tasks)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => Sprint, (sprint) => sprint.tasks)
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint;
}
