import {
  CreateAgentCommandHandler,
  CreateMessageCommandHandler,
  CreateUserCommandHandler,
} from './commands';
import { SendUserMessageEventHandler } from './events';
import { GetUserMessagesQueryHandler } from './queries';

export * from './commands';
export * from './events';
export * from './queries';

export const commandHandlers = [
  CreateAgentCommandHandler,
  CreateUserCommandHandler,
  CreateMessageCommandHandler,
];

export const eventHandlers = [SendUserMessageEventHandler];

export const queryHandlers = [GetUserMessagesQueryHandler];
