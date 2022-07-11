import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../entities';
import {
  MessagePriorities,
  MessageSenders,
  MessageTypes,
} from '../../../utils';
import {
  GetUserDetailsQuery,
  GetUserDetailsQueryHandler,
} from './get-user-details.query';

describe(GetUserDetailsQueryHandler.name, () => {
  let handler: GetUserDetailsQueryHandler;
  let module: TestingModule;

  const userRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        GetUserDetailsQueryHandler,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();
    handler = module.get<GetUserDetailsQueryHandler>(
      GetUserDetailsQueryHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${GetUserDetailsQueryHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should fetch user details and return them', async () => {
    const userId = 1;
    const date = new Date().toISOString();
    const user = {
      id: userId,
      firstName: 'Bender',
      lastName: 'Rodriguez',
      email: 'bender@futurama.com',
      messages: [
        {
          id: 1,
          body: 'I want to take a loan',
          type: MessageTypes.TEXT,
          sender: MessageSenders.USER,
          priority: MessagePriorities.HIGH,
          createdAt: date,
        },
      ],
    };
    userRepository.findOne = jest.fn().mockResolvedValue(user);
    const query = new GetUserDetailsQuery(userId);

    const response = await handler.execute(query);
    expect.assertions(3);
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith({
      where: { id: userId },
      relations: {
        messages: {
          id: true,
          body: true,
          type: true,
          sender: true,
          createdAt: true,
          priority: true,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        messages: true,
      },
    });
    expect(response).toStrictEqual(user);
  });

  it('should throw a database error when fetching user details', async () => {
    const userId = 1;
    const message = 'Database error';
    userRepository.findOne = jest.fn().mockRejectedValue(new Error(message));
    const query = new GetUserDetailsQuery(userId);

    try {
      await handler.execute(query);
    } catch (err) {
      expect.assertions(3);
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith({
        where: { id: userId },
        relations: {
          messages: {
            id: true,
            body: true,
            type: true,
            sender: true,
            createdAt: true,
            priority: true,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          messages: true,
        },
      });
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });

  it('should throw a bad request error when fetching user details', async () => {
    const userId = 1;
    const message = 'User not found';
    userRepository.findOne = jest.fn().mockResolvedValue(null);
    const query = new GetUserDetailsQuery(userId);
    try {
      await handler.execute(query);
    } catch (err) {
      expect.assertions(3);
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith({
        where: { id: userId },
        relations: {
          messages: {
            id: true,
            body: true,
            type: true,
            sender: true,
            createdAt: true,
            priority: true,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          messages: true,
        },
      });
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.BAD_REQUEST),
      );
    }
  });
});
