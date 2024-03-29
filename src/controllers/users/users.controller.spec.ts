import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import {
  CreateUserCommand,
  CreateMessageCommand,
  SendMessageToAgentsEvent,
  GetUserMessagesQuery,
  GetUserDetailsQuery,
} from '../../application';
import { CreateMessageDto, CreateUserDto } from '../../dtos';
import { AgentsUsers } from '../../entities';
import { ConnectionService } from '../../services';
import { MessageSenders } from '../../utils';
import { UsersController } from './users.controller';

describe(UsersController.name, () => {
  let controller: UsersController;
  let module: TestingModule;
  const commandBus = {
    execute: jest.fn(),
  } as unknown as CommandBus;
  const eventBus = {
    publish: jest.fn(),
  } as unknown as EventBus;
  const queryBus = {
    execute: jest.fn(),
  } as unknown as QueryBus;

  const request = {
    on: jest.fn(),
  } as unknown as Request;
  const response = {
    setHeader: jest.fn(),
  } as unknown as Response;
  const connectionService = {
    setUserConnection: jest.fn(),
  } as unknown as ConnectionService;
  const agentsUsersRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: EventBus, useValue: eventBus },
        { provide: QueryBus, useValue: queryBus },
        { provide: ConnectionService, useValue: connectionService },
        {
          provide: getRepositoryToken(AgentsUsers),
          useValue: agentsUsersRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${UsersController.name} should be defined`, () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto = {
      email: 'found@example.com',
      firstName: 'Found',
      lastName: 'Example',
      password: 'Password',
    } as CreateUserDto;

    it('should call commandBus.execute', async () => {
      commandBus.execute = jest
        .fn()
        .mockResolvedValue({ ...createUserDto, id: 1 });
      const user = await controller.createUser(createUserDto);
      expect.assertions(3);
      expect(commandBus.execute).toBeCalledTimes(1);
      expect(commandBus.execute).toBeCalledWith(
        new CreateUserCommand(createUserDto),
      );
      expect(user).toStrictEqual({ ...createUserDto, id: 1 });
    });
  });

  describe('sendMessage', () => {
    it('should call commandBus.execute and eventBus.publish', async () => {
      const messageDto = {
        userId: 1,
        body: 'I want to get a loan',
        type: 'TEXT',
      } as CreateMessageDto;
      const response = {
        ...messageDto,
        createdAt: new Date().toISOString(),
        id: 1,
        sender: 'USER',
      };
      commandBus.execute = jest.fn().mockResolvedValue(response);
      const message = await controller.sendMessage(messageDto);
      expect.assertions(5);
      expect(commandBus.execute).toBeCalledTimes(1);
      expect(commandBus.execute).toBeCalledWith(
        new CreateMessageCommand(messageDto, MessageSenders.USER),
      );
      expect(message).toStrictEqual(response);
      expect(eventBus.publish).toBeCalledTimes(1);
      expect(eventBus.publish).toBeCalledWith(
        new SendMessageToAgentsEvent(message),
      );
    });
  });

  describe('getMessages', () => {
    const param = { userId: 1 };

    it('should call queryBus.execute', async () => {
      await controller.getMessages(param);
      expect.assertions(2);
      expect(queryBus.execute).toBeCalledTimes(1);
      expect(queryBus.execute).toBeCalledWith(
        new GetUserMessagesQuery(param.userId),
      );
    });
  });

  describe('subscribe', () => {
    const param = { userId: 1 };
    it('should subscribe user to messages', async () => {
      controller.subscribe(param, request, response);
      expect.assertions(5);
      expect(request.on).toBeCalledTimes(1);
      expect(response.setHeader).toBeCalledTimes(1);
      expect(response.setHeader).toBeCalledWith(
        'Content-Type',
        'text/event-stream',
      );
      expect(connectionService.setUserConnection).toBeCalledTimes(1);
      expect(connectionService.setUserConnection).toBeCalledWith(
        param.userId,
        response,
      );
    });
  });

  describe('getUserDetails', () => {
    const param = { userId: 1 };

    it('should call queryBus.execute', async () => {
      await controller.getUserDetails(param);
      expect.assertions(2);
      expect(queryBus.execute).toBeCalledTimes(1);
      expect(queryBus.execute).toBeCalledWith(
        new GetUserDetailsQuery(+param.userId),
      );
    });
  });
});
