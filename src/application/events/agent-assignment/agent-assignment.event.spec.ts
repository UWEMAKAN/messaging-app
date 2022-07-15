import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ConnectionService } from '../../../services';
import {
  AgentAssignmentEvent,
  AgentAssignmentEventHandler,
} from './agent-assignment.event';

describe(AgentAssignmentEventHandler.name, () => {
  let handler: AgentAssignmentEventHandler;
  let module: TestingModule;

  const write = jest.fn();
  const conn = { write } as unknown as Response;

  const connectionService = {
    getAgentConnection: jest.fn().mockReturnValue(conn),
  } as unknown as ConnectionService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AgentAssignmentEventHandler,
        { provide: ConnectionService, useValue: connectionService },
      ],
    }).compile();
    handler = module.get<AgentAssignmentEventHandler>(
      AgentAssignmentEventHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${AgentAssignmentEventHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should call connectionService.getAgentConnections and conn.write to send event to agent', () => {
    const agentId = 1;
    const userId = 1;
    const assigned = true;
    const event = new AgentAssignmentEvent(agentId, assigned, userId);
    handler.handle(event);
    expect.assertions(3);
    expect(connectionService.getAgentConnection).toBeCalledTimes(1);
    expect(connectionService.getAgentConnection).toBeCalledWith(agentId);
    expect(conn.write).toBeCalledTimes(1);
  });
});
