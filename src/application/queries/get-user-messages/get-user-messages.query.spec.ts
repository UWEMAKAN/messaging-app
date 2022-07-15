import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';
import { Message } from '../../../entities';
import { ConnectionService } from '../../../services';
import { MessageSenders } from '../../../utils';
import {
  GetUserMessagesQuery,
  GetUserMessagesQueryHandler,
} from './get-user-messages.query';

describe(GetUserMessagesQueryHandler.name, () => {
  let handler: GetUserMessagesQueryHandler;
  let module: TestingModule;

  const createdAt = new Date().toISOString();

  const messageRepository = {
    createQueryBuilder: jest.fn(),
  };

  const conn = { write: jest.fn() } as unknown as Response;

  const connectionService = {
    getUserConnection: jest.fn().mockReturnValue(conn),
  } as unknown as ConnectionService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GetUserMessagesQueryHandler,
        { provide: getRepositoryToken(Message), useValue: messageRepository },
        { provide: ConnectionService, useValue: connectionService },
      ],
    }).compile();

    handler = module.get<GetUserMessagesQueryHandler>(
      GetUserMessagesQueryHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${GetUserMessagesQueryHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should fetch and return messages to the user', async () => {
    const message = {
      id: 1,
      userId: 1,
      body: 'I want to take a loan',
      createdAt,
      type: 'TEXT',
      sender: MessageSenders.USER,
    };
    const getRawMany = jest.fn().mockResolvedValue([message]);
    const select = jest.fn().mockReturnValue({ getRawMany });
    const orderBy = jest.fn().mockReturnValue({ select });
    const where = jest.fn().mockReturnValue({ orderBy });
    const createQueryBuilder = jest.fn().mockReturnValue({ where });
    messageRepository.createQueryBuilder = createQueryBuilder;

    const param = { userId: 1 };
    const query = new GetUserMessagesQuery(param.userId);
    const response = await handler.execute(query);
    expect.assertions(6);
    expect(response[0]).toStrictEqual(message);
    expect(createQueryBuilder).toBeCalledTimes(1);
    expect(where).toBeCalledTimes(1);
    expect(orderBy).toBeCalledTimes(1);
    expect(select).toBeCalledTimes(1);
    expect(getRawMany).toBeCalledTimes(1);
  });

  it('should throw an internal server error', async () => {
    const message = 'Database error';
    const getRawMany = jest.fn().mockRejectedValue(new Error(message));
    const select = jest.fn().mockReturnValue({ getRawMany });
    const orderBy = jest.fn().mockReturnValue({ select });
    const where = jest.fn().mockReturnValue({ orderBy });
    const createQueryBuilder = jest.fn().mockReturnValue({ where });
    messageRepository.createQueryBuilder = createQueryBuilder;

    const param = { userId: 1 };
    const query = new GetUserMessagesQuery(param.userId);
    try {
      await handler.execute(query);
    } catch (err) {
      expect.assertions(6);
      expect(createQueryBuilder).toBeCalledTimes(1);
      expect(where).toBeCalledTimes(1);
      expect(orderBy).toBeCalledTimes(1);
      expect(select).toBeCalledTimes(1);
      expect(getRawMany).toBeCalledTimes(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });
});
