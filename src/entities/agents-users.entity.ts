import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'agents_users' })
export class AgentsUsers {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  agentId: number;

  @Column({ type: 'bigint' })
  userId: number;
}
