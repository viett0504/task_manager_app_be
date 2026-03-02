import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { TeamMember } from './TeamMember';
import { Task } from './Task';
import { Sprint } from './Sprint';
import { ActivityLog } from './ActivityLog';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  owner_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => TeamMember, (member) => member.team)
  members: TeamMember[];

  @OneToMany(() => Task, (task) => task.team)
  tasks: Task[];

  @OneToMany(() => Sprint, (sprint) => sprint.team)
  sprints: Sprint[];

  @OneToMany(() => ActivityLog, (log) => log.team)
  activity_logs: ActivityLog[];
}
