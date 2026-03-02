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
import { Team } from './Team';
import { Task } from './Task';
import { Milestone } from './Milestone';

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'uuid' })
  team_id: string;

  @Column({ length: 50 })
  status: string; // 'planned', 'active', 'completed'

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'int', default: 0 })
  velocity: number;

  @Column({ type: 'int', default: 0 })
  efficiency: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Team, (team) => team.sprints)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @OneToMany(() => Task, (task) => task.sprint)
  tasks: Task[];

  @OneToMany(() => Milestone, (milestone) => milestone.sprint)
  milestones: Milestone[];
}
