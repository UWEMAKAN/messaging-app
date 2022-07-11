import {
  AssignAgentCommandHandler,
  CreateAgentCommandHandler,
  CreateMessageCommandHandler,
  CreateUserCommandHandler,
  UnassignAgentCommandHandler,
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
  AssignAgentCommandHandler,
  CreateAgentCommandHandler,
  CreateMessageCommandHandler,
  CreateUserCommandHandler,
  UnassignAgentCommandHandler,
];

export const eventHandlers = [
  SendMessageToAgentsEventHandler,
  SendMessageToUserEventHandler,
];

export const queryHandlers = [
  GetAgentMessagesQueryHandler,
  GetUserMessagesQueryHandler,
];
