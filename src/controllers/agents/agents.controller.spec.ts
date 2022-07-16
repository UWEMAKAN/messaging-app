import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import {
  AssignAgentCommand,
  CreateAgentCommand,
  CreateMessageCommand,
  GetAgentMessagesQuery,
  SendMessageToAgentsEvent,
  SendMessageToUserEvent,
} from '../../application';
import {
  CreateAgentDto,
  CreateAgentMessageDto,
  CreateMessageResponse,
} from '../../dtos';
import { AgentsUsers, StockMessage } from '../../entities';
import { ConnectionService } from '../../services';
import { MessageSenders } from '../../utils';
import { AgentsController } from './agents.controller';

describe('AgentsController', () => {
  let controller: AgentsController;
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
    setAgentConnection: jest.fn(),
  } as unknown as ConnectionService;
  const agentsUsersRepository = {
    find: jest.fn(),
  };
  const stockMessageRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: EventBus, useValue: eventBus },
        { provide: QueryBus, useValue: queryBus },
        { provide: ConnectionService, useValue: connectionService },
        {
          provide: getRepositoryToken(AgentsUsers),
          useValue: agentsUsersRepository,
        },
        {
          provide: getRepositoryToken(StockMessage),
          useValue: stockMessageRepository,
        },
      ],
    }).compile();

    controller = module.get<AgentsController>(AgentsController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  test('should call commandBus.execute', async () => {
    const createAgentDto = {
      email: 'found@example.com',
      firstName: 'Found',
      lastName: 'Example',
      password: 'Password',
    } as CreateAgentDto;
    commandBus.execute = jest
      .fn()
      .mockResolvedValue({ ...createAgentDto, id: 1 });
    const agent = await controller.createAgent(createAgentDto);
    expect.assertions(3);
    expect(commandBus.execute).toBeCalledTimes(1);
    expect(commandBus.execute).toBeCalledWith(
      new CreateAgentCommand(createAgentDto),
    );
    expect(agent).toStrictEqual({ ...createAgentDto, id: 1 });
  });

  test('should call commandBus.execute and eventBus.publish', async () => {
    const userId = 1;
    const agentId = 1;
    const body = 'How may I be of help';
    const type = 'TEXT';
    const createMessageDto = {
      userId,
      agentId,
      body,
      type,
    } as CreateAgentMessageDto;
    const response: CreateMessageResponse = {
      body,
      userId,
      type,
      id: 1,
      priority: 1,
      sender: 'AGENT',
      createdAt: new Date().toISOString(),
    };
    commandBus.execute = jest.fn().mockResolvedValue(response);
    const message = await controller.sendMessage(createMessageDto);
    expect.assertions(6);
    expect(commandBus.execute).toBeCalledTimes(2);
    expect(commandBus.execute).toHaveBeenNthCalledWith(
      1,
      new AssignAgentCommand(createMessageDto.agentId, createMessageDto.userId),
    );
    expect(commandBus.execute).toHaveBeenNthCalledWith(
      2,
      new CreateMessageCommand({ body, type, userId }, MessageSenders.AGENT),
    );
    expect(eventBus.publish).toBeCalledTimes(2);
    expect(eventBus.publish).toHaveBeenNthCalledWith(
      1,
      new SendMessageToUserEvent({
        id: message.id,
        userId: message.userId,
        body: message.body,
        sender: message.sender,
        type: message.type,
        createdAt: message.createdAt,
      }),
    );
    expect(eventBus.publish).toHaveBeenNthCalledWith(
      2,
      new SendMessageToAgentsEvent(message, agentId),
    );
  });

  describe('getMessages', () => {
    const dto = { duration: 'ONE_DAY' };
    it('should call queryBus.execute', async () => {
      await controller.getMessages(dto);
      expect.assertions(2);
      expect(queryBus.execute).toBeCalledTimes(1);
      expect(queryBus.execute).toBeCalledWith(new GetAgentMessagesQuery(dto));
    });
  });

  describe('subscribe', () => {
    const dto = { messageId: 1 };
    const param = { agentId: 1 };

    it('should subscribe to new messages', async () => {
      dto.messageId = undefined;
      controller.subscribe(param, request, response);
      expect.assertions(5);
      expect(request.on).toBeCalledTimes(1);
      expect(response.setHeader).toBeCalledTimes(1);
      expect(response.setHeader).toBeCalledWith(
        'Content-Type',
        'text/event-stream',
      );
      expect(connectionService.setAgentConnection).toBeCalledTimes(1);
      expect(connectionService.setAgentConnection).toBeCalledWith(
        param.agentId,
        response,
      );
    });
  });

  describe('getTickets', () => {
    it('should call agentsUsersRepository.find', async () => {
      await controller.getTickets();
      expect.assertions(2);
      expect(agentsUsersRepository.find).toBeCalledTimes(1);
      expect(agentsUsersRepository.find).toBeCalledWith({
        select: ['agentId', 'userId'],
      });
    });

    it('should throw database error when trying to fetch tickets', async () => {
      const message = 'Database error';
      agentsUsersRepository.find = jest
        .fn()
        .mockRejectedValue(new Error(message));
      try {
        await controller.getTickets();
      } catch (err) {
        expect.assertions(3);
        expect(agentsUsersRepository.find).toBeCalledTimes(1);
        expect(agentsUsersRepository.find).toBeCalledWith({
          select: ['agentId', 'userId'],
        });
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });
  });

  describe('addStockMessage', () => {
    const dto = {
      messages: [
        {
          text: 'How may I be of service?',
          id: 1,
        },
      ],
    };
    it('should add or update stock message', async () => {
      await controller.addStockMessages(dto);
      expect.assertions(2);
      expect(stockMessageRepository.save).toBeCalledTimes(1);
      expect(stockMessageRepository.save).toBeCalledWith(dto.messages);
    });
  });

  describe('getStockMessage', () => {
    it('should add or update stock message', async () => {
      await controller.getStockMessages();
      expect.assertions(1);
      expect(stockMessageRepository.find).toBeCalledTimes(1);
    });
  });
});
