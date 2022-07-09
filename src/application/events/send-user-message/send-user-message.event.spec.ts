import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CreateMessageResponse } from '../../../dtos';
import { ConnectionService } from '../../../services';
import {
  SendUserMessageEvent,
  SendUserMessageEventHandler,
} from './send-user-message.event';

describe(SendUserMessageEventHandler.name, () => {
  let module: TestingModule;
  let handler: SendUserMessageEventHandler;

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
        SendUserMessageEventHandler,
      ],
    }).compile();

    handler = module.get<SendUserMessageEventHandler>(
      SendUserMessageEventHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${SendUserMessageEventHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  test('should call connectionService.getAgentConnections and conn.write if agent is connected', () => {
    const message: CreateMessageResponse = {
      id: 1,
      body: 'I want to take a loan',
      userId: 1,
      priority: 1,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
    };
    const event = new SendUserMessageEvent(message);
    handler.handle(event);
    expect.assertions(4);
    expect(connectionService.getAgentConnections).toBeCalledTimes(1);
    expect(conn.write).toBeCalledTimes(1);
    expect(conn.write).toBeCalledWith(`data: ${JSON.stringify(message)}\n\n`);
    expect(conn.write).toReturnWith(true);
  });

  test('should call connectionService.getAgentConnections, conn.write and connectionService.removeAgentConnection', () => {
    conn.write = jest.fn().mockReturnValue(false);
    connectionService.removeAgentConnection = jest.fn();
    const message: CreateMessageResponse = {
      id: 1,
      body: 'I want to take a loan',
      userId: 1,
      priority: 1,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
    };
    const event = new SendUserMessageEvent(message);
    handler.handle(event);
    expect.assertions(6);
    expect(connectionService.getAgentConnections).toBeCalledTimes(1);
    expect(connectionService.removeAgentConnection).toBeCalledTimes(1);
    expect(connectionService.removeAgentConnection).toBeCalledWith(1);
    expect(conn.write).toBeCalledTimes(1);
    expect(conn.write).toBeCalledWith(`data: ${JSON.stringify(message)}\n\n`);
    expect(conn.write).toReturnWith(false);
  });
});
