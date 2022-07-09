import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'agents_users' })
export class AgentsUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  agentId: number;

  @Column()
  userId: number;
}
