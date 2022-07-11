import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
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

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: EventBus, useValue: eventBus },
        { provide: QueryBus, useValue: queryBus },
        ConnectionService,
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
      new SendMessageToUserEvent(message),
    );
    expect(eventBus.publish).toHaveBeenNthCalledWith(
      2,
      new SendMessageToAgentsEvent(message, agentId),
    );
  });

  describe('getMessages', () => {
    const dto = { messageId: 1 };
    const param = { agentId: 1 };

    it('should call queryBus.execute', async () => {
      await controller.getMessages(dto, param);
      expect.assertions(2);
      expect(queryBus.execute).toBeCalledTimes(1);
      expect(queryBus.execute).toBeCalledWith(
        new GetAgentMessagesQuery(dto, param),
      );
    });

    it('should not call queryBus.execute', async () => {
      dto.messageId = undefined;
      await controller.getMessages(dto, param);
      expect.assertions(1);
      expect(queryBus.execute).not.toBeCalled();
    });
  });
});
