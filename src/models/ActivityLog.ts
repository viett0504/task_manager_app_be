import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Team } from './Team';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  team_id: string;

  @Column({ length: 50 })
  action_type: string; // 'task_moved', 'task_created', etc.

  @Column({ type: 'text' })
  action_description: string;

  @Column({ type: 'uuid', nullable: true })
  target_id: string;

  @Column({ length: 50, nullable: true })
  target_type: string; // 'task', 'sprint', etc.

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.activity_logs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Team, (team) => team.activity_logs)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
