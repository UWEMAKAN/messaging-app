import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { CreateMessageResponse } from '../../../dtos';
import { ConnectionService } from '../../../services';
import { MessageSenders } from '../../../utils';
import {
  SendMessageToUserEvent,
  SendMessageToUserEventHandler,
} from './send-message-to-user.event';

test('should first', () => {
  expect(true).toBeTruthy();
});

describe(SendMessageToUserEventHandler.name, () => {
  let handler: SendMessageToUserEventHandler;
  let module: TestingModule;

  const conn = {
    write: jest.fn().mockReturnValue(true),
  } as unknown as Response;

  const connectionService = {
    getUserConnection: jest.fn().mockReturnValue(conn),
  } as unknown as ConnectionService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        SendMessageToUserEventHandler,
        { provide: ConnectionService, useValue: connectionService },
      ],
    }).compile();
    handler = module.get<SendMessageToUserEventHandler>(
      SendMessageToUserEventHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${SendMessageToUserEventHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  test('should call connectionService.getUserConnection and conn.write', () => {
    const message: CreateMessageResponse = {
      id: 1,
      body: 'I want to take a loan',
      userId: 1,
      priority: 1,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
      sender: MessageSenders.AGENT,
    };
    const event = new SendMessageToUserEvent(message);
    handler.handle(event);
    expect.assertions(5);
    expect(connectionService.getUserConnection).toBeCalledTimes(1);
    expect(connectionService.getUserConnection).toBeCalledWith(message.userId);
    expect(conn.write).toBeCalledTimes(1);
    expect(conn.write).toBeCalledWith(`data: ${JSON.stringify(message)}\n\n`);
    expect(conn.write).toReturnWith(true);
  });
});
