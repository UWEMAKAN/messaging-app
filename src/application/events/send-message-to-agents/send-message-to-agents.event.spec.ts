import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CreateMessageResponse } from '../../../dtos';
import { ConnectionService } from '../../../services';
import { MessageSenders } from '../../../utils';
import {
  SendMessageToAgentsEvent,
  SendMessageToAgentsEventHandler,
} from './send-message-to-agents.event';

describe(SendMessageToAgentsEventHandler.name, () => {
  let module: TestingModule;
  let handler: SendMessageToAgentsEventHandler;

  const conn = {
    write: jest.fn().mockReturnValue(true),
  } as unknown as Response;

  const agentConn = [1, conn];

  const connectionService = {
    getAgentConnections: jest.fn().mockReturnValue([agentConn]),
  } as unknown as ConnectionService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        { provide: ConnectionService, useValue: connectionService },
        SendMessageToAgentsEventHandler,
      ],
    }).compile();

    handler = module.get<SendMessageToAgentsEventHandler>(
      SendMessageToAgentsEventHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${SendMessageToAgentsEventHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should call connectionService.getAgentConnections and conn.write and send to agents', () => {
    const message: CreateMessageResponse = {
      id: 1,
      body: 'I want to take a loan',
      userId: 1,
      priority: 1,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
      sender: MessageSenders.USER,
    };
    const event = new SendMessageToAgentsEvent(message);
    handler.handle(event);
    expect.assertions(4);
    expect(connectionService.getAgentConnections).toBeCalledTimes(1);
    expect(conn.write).toBeCalledTimes(1);
    expect(conn.write).toBeCalledWith(`data: ${JSON.stringify(message)}\n\n`);
    expect(conn.write).toReturnWith(true);
  });

  it('should call connectionService.getAgentConnections, conn.write', () => {
    conn.write = jest.fn().mockReturnValue(false);
    connectionService.removeAgentConnection = jest.fn();
    const message: CreateMessageResponse = {
      id: 1,
      body: 'I want to take a loan',
      userId: 1,
      priority: 1,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
      sender: MessageSenders.USER,
    };
    const event = new SendMessageToAgentsEvent(message);
    handler.handle(event);
    expect.assertions(4);
    expect(connectionService.getAgentConnections).toBeCalledTimes(1);
    expect(conn.write).toBeCalledTimes(1);
    expect(conn.write).toBeCalledWith(`data: ${JSON.stringify(message)}\n\n`);
    expect(conn.write).toReturnWith(false);
  });
});
