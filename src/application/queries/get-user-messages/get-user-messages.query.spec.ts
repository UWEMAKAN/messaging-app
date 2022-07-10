import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Readable } from 'stream';
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

  const readStream = new Readable({
    read: () => ({
      id: 1,
      userId: 1,
      body: 'I want to take a loan',
      createdAt,
      type: 'TEXT',
      sender: MessageSenders.USER,
    }),
  });
  jest.spyOn(readStream, 'pipe');

  const messageRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GetUserMessagesQueryHandler,
        { provide: getRepositoryToken(Message), useValue: messageRepository },
        ConnectionService,
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

  it('should fetch return messages', async () => {
    const stream = jest.fn().mockResolvedValue(readStream);
    const select = jest.fn().mockReturnValue({ stream });
    const orderBy = jest.fn().mockReturnValue({ select });
    const andWhere = jest.fn().mockReturnValue({ orderBy });
    const where = jest.fn().mockReturnValue({ andWhere });
    const createQueryBuilder = jest.fn().mockReturnValue({ where });
    messageRepository.createQueryBuilder = createQueryBuilder;

    const dto = { messageId: 1 };
    const param = { userId: 1 };
    const query = new GetUserMessagesQuery(dto, param);
    await handler.execute(query);
    expect.assertions(7);
    expect(createQueryBuilder).toBeCalledTimes(1);
    expect(where).toBeCalledTimes(1);
    expect(andWhere).toBeCalledTimes(1);
    expect(orderBy).toBeCalledTimes(1);
    expect(select).toBeCalledTimes(1);
    expect(stream).toBeCalledTimes(1);
    expect(readStream.pipe).toBeCalledTimes(1);
  });

  it('should throw an internal server error', async () => {
    const message = 'Database error';
    const stream = jest.fn().mockRejectedValue(new Error(message));
    const select = jest.fn().mockReturnValue({ stream });
    const orderBy = jest.fn().mockReturnValue({ select });
    const andWhere = jest.fn().mockReturnValue({ orderBy });
    const where = jest.fn().mockReturnValue({ andWhere });
    const createQueryBuilder = jest.fn().mockReturnValue({ where });
    messageRepository.createQueryBuilder = createQueryBuilder;

    const dto = { messageId: 1 };
    const param = { userId: 1 };
    const query = new GetUserMessagesQuery(dto, param);
    try {
      await handler.execute(query);
    } catch (err) {
      expect.assertions(7);
      expect(createQueryBuilder).toBeCalledTimes(1);
      expect(where).toBeCalledTimes(1);
      expect(andWhere).toBeCalledTimes(1);
      expect(orderBy).toBeCalledTimes(1);
      expect(select).toBeCalledTimes(1);
      expect(stream).toBeCalledTimes(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });
});
