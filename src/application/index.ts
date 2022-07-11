import {
  AssignAgentCommandHandler,
  CreateAgentCommandHandler,
  CreateMessageCommandHandler,
  CreateUserCommandHandler,
} from './commands';
import {
  SendMessageToAgentsEventHandler,
  SendMessageToUserEventHandler,
} from './events';
import {
  GetAgentMessagesQueryHandler,
  GetUserMessagesQueryHandler,
} from './queries';

export * from './commands';
export * from './events';
export * from './queries';

export const commandHandlers = [
  CreateAgentCommandHandler,
  CreateUserCommandHandler,
  CreateMessageCommandHandler,
  AssignAgentCommandHandler,
];

export const eventHandlers = [
  SendMessageToAgentsEventHandler,
  SendMessageToUserEventHandler,
];

export const queryHandlers = [
  GetUserMessagesQueryHandler,
  GetAgentMessagesQueryHandler,
];
