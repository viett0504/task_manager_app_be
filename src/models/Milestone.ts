import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sprint } from './Sprint';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sprint_id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ default: false })
  is_completed: boolean;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Sprint, (sprint) => sprint.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint;
}
