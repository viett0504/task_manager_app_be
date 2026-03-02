import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Team } from './Team';
import { User } from './User';

@Entity('team_members')
@Unique(['team_id', 'user_id'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  team_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ length: 50 })
  role: string; // 'admin', 'member'

  @Column({ type: 'int', default: 0 })
  allocation_percentage: number;

  @CreateDateColumn()
  joined_at: Date;

  // Relations
  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, (user) => user.team_memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
