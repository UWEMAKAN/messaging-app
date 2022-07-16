import {
  AssignAgentCommandHandler,
  CreateAgentCommandHandler,
  CreateMessageCommandHandler,
  CreateUserCommandHandler,
  UnassignAgentCommandHandler,
  UnassignAllCommandHandler,
} from './commands';
import {
  AgentAssignmentEventHandler,
  PushStockMessagesEventHandler,
  SendMessageToAgentsEventHandler,
  SendMessageToUserEventHandler,
} from './events';
import {
  GetAgentMessagesQueryHandler,
  GetUserDetailsQueryHandler,
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
  UnassignAllCommandHandler,
];

export const eventHandlers = [
  SendMessageToAgentsEventHandler,
  SendMessageToUserEventHandler,
  AgentAssignmentEventHandler,
  PushStockMessagesEventHandler,
];

export const queryHandlers = [
  GetAgentMessagesQueryHandler,
  GetUserDetailsQueryHandler,
  GetUserMessagesQueryHandler,
];
