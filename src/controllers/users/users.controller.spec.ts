import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateUserCommand,
  CreateMessageCommand,
  SendUserMessageEvent,
} from '../../application';
import { CreateMessageDto, CreateUserDto } from '../../dtos';
import { ConnectionService } from '../../services';
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

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: EventBus, useValue: eventBus },
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
        new CreateMessageCommand(messageDto),
      );
      expect(message).toStrictEqual(response);
      expect(eventBus.publish).toBeCalledTimes(1);
      expect(eventBus.publish).toBeCalledWith(
        new SendUserMessageEvent(message),
      );
    });
  });
});
