import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Timestamp,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @Column()
  type: string;

  @ManyToOne(() => User, (user: User) => user.messages)
  user: User;

  @Column()
  priority: number;

  @Column()
  sender: string;

  @CreateDateColumn()
  createdAt: Timestamp;
}
