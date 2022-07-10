import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateUserCommand,
  CreateMessageCommand,
  SendMessageToAgentsEvent,
  GetUserMessagesQuery,
} from '../../application';
import { CreateMessageDto, CreateUserDto } from '../../dtos';
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

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: EventBus, useValue: eventBus },
        { provide: QueryBus, useValue: queryBus },
        ConnectionService,
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
    const dto = { messageId: 1 };
    const param = { userId: 1 };

    it('should call queryBus.execute', async () => {
      await controller.getMessages(dto, param);
      expect.assertions(2);
      expect(queryBus.execute).toBeCalledTimes(1);
      expect(queryBus.execute).toBeCalledWith(
        new GetUserMessagesQuery(dto, param),
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
