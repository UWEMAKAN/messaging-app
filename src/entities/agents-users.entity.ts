import { Column, Entity } from 'typeorm';

@Entity({ name: 'agents_users' })
export class AgentsUsers {
  @Column({ type: 'bigint' })
  agentId: number;

  @Column({ type: 'bigint' })
  userId: number;
}
