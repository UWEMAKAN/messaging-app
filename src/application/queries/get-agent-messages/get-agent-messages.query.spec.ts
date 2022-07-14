import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';
import { Readable } from 'stream';
import { Message } from '../../../entities';
import { ConnectionService } from '../../../services';
import { MessagePriorities, MessageSenders } from '../../../utils';
import {
  GetAgentMessagesQuery,
  GetAgentMessagesQueryHandler,
} from './get-agent-messages.query';

describe(GetAgentMessagesQueryHandler.name, () => {
  let handler: GetAgentMessagesQueryHandler;
  let module: TestingModule;

  const createdAt = new Date().toISOString();
  const readStream = new Readable({
    read: () => ({
      id: 1,
      userId: 1,
      body: 'I want to take a loan',
      createdAt,
      type: 'TEXT',
      sender: MessageSenders.AGENT,
      priority: MessagePriorities.HIGH,
    }),
  });
  jest.spyOn(readStream, 'pipe');

  const messageRepository = {
    createQueryBuilder: jest.fn(),
  };

  const conn = { write: jest.fn() } as unknown as Response;

  const connectionService = {
    getAgentConnection: jest.fn().mockReturnValue(conn),
  } as unknown as ConnectionService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GetAgentMessagesQueryHandler,
        { provide: ConnectionService, useValue: connectionService },
        { provide: getRepositoryToken(Message), useValue: messageRepository },
      ],
    }).compile();
    handler = module.get<GetAgentMessagesQueryHandler>(
      GetAgentMessagesQueryHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${GetAgentMessagesQueryHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should fetch and return messages to the agent', async () => {
    const stream = jest.fn().mockResolvedValue(readStream);
    const getQuery = jest.fn().mockReturnValue('query');
    const groupBy = jest.fn().mockReturnValue({ getQuery });
    const limit = jest.fn().mockReturnValue({ stream });
    const leftJoin = jest.fn().mockReturnValue({ limit });
    const addOrderBy = jest.fn().mockReturnValue({ leftJoin });
    const orderBy = jest.fn().mockReturnValue({ addOrderBy });
    const andWhere = jest.fn().mockReturnValue({ orderBy });
    const where = jest.fn().mockReturnValue({ andWhere });
    const select = jest.fn().mockReturnValue({ groupBy, where });
    const createQueryBuilder = jest.fn().mockReturnValue({ select });
    messageRepository.createQueryBuilder = createQueryBuilder;

    const dto = { messageId: 1 };
    const param = { agentId: 1 };
    const query = new GetAgentMessagesQuery(dto, param);
    await handler.execute(query);
    expect.assertions(12);
    expect(createQueryBuilder).toBeCalledTimes(2);
    expect(select).toBeCalledTimes(2);
    expect(groupBy).toBeCalledTimes(1);
    expect(getQuery).toBeCalledTimes(1);
    expect(where).toBeCalledTimes(1);
    expect(andWhere).toBeCalledTimes(1);
    expect(orderBy).toBeCalledTimes(1);
    expect(addOrderBy).toBeCalledTimes(1);
    expect(leftJoin).toBeCalledTimes(1);
    expect(limit).toBeCalledTimes(1);
    expect(stream).toBeCalledTimes(1);
    expect(readStream.pipe).toBeCalledTimes(1);
  });

  it('should fetch and return messages to the agent', async () => {
    const message = 'Database error';
    const stream = jest.fn().mockRejectedValue(new Error(message));
    const getQuery = jest.fn().mockReturnValue('query');
    const groupBy = jest.fn().mockReturnValue({ getQuery });
    const limit = jest.fn().mockReturnValue({ stream });
    const leftJoin = jest.fn().mockReturnValue({ limit });
    const addOrderBy = jest.fn().mockReturnValue({ leftJoin });
    const orderBy = jest.fn().mockReturnValue({ addOrderBy });
    const andWhere = jest.fn().mockReturnValue({ orderBy });
    const where = jest.fn().mockReturnValue({ andWhere });
    const select = jest.fn().mockReturnValue({ groupBy, where });
    const createQueryBuilder = jest.fn().mockReturnValue({ select });
    messageRepository.createQueryBuilder = createQueryBuilder;

    const dto = { messageId: 1 };
    const param = { agentId: 1 };
    const query = new GetAgentMessagesQuery(dto, param);
    try {
      await handler.execute(query);
    } catch (err) {
      expect.assertions(12);
      expect(createQueryBuilder).toBeCalledTimes(2);
      expect(select).toBeCalledTimes(2);
      expect(groupBy).toBeCalledTimes(1);
      expect(getQuery).toBeCalledTimes(1);
      expect(where).toBeCalledTimes(1);
      expect(andWhere).toBeCalledTimes(1);
      expect(orderBy).toBeCalledTimes(1);
      expect(addOrderBy).toBeCalledTimes(1);
      expect(leftJoin).toBeCalledTimes(1);
      expect(limit).toBeCalledTimes(1);
      expect(stream).toBeCalledTimes(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });
});
