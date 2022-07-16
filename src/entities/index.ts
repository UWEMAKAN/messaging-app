import { Agent } from './agent.entity';
import { AgentsUsers } from './agents-users.entity';
import { Message } from './message.entity';
import { StockMessage } from './stock-message.entity';
import { User } from './user.entity';

export * from './agent.entity';
export * from './agents-users.entity';
export * from './message.entity';
export * from './stock-message.entity';
export * from './user.entity';

export const entities = [Agent, AgentsUsers, Message, StockMessage, User];
