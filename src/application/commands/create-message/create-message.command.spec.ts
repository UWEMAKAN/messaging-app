import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateMessageDto } from '../../../dtos';
import { Message, User } from '../../../entities';
import { MessageSenders } from '../../../utils';
import {
  CreateMessageCommand,
  CreateMessageCommandHandler,
} from './create-message.command';

const messageDto = {
  userId: 1,
  body: 'I want to get a loan',
  type: 'TEXT',
} as CreateMessageDto;

const firstName = 'Bender';
const lastName = 'Rodriguez';

const response = {
  ...messageDto,
  createdAt: new Date().toISOString(),
  priority: 1,
  id: 2,
  sender: MessageSenders.USER,
  firstName,
  lastName,
};

describe(CreateMessageCommandHandler.name, () => {
  let handler: CreateMessageCommandHandler;
  let module: TestingModule;

  const userRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 1, firstName, lastName }),
  };
  const messageRepository = {
    save: jest.fn().mockResolvedValue(response),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CreateMessageCommandHandler,
        { provide: getRepositoryToken(Message), useValue: messageRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    handler = module.get<CreateMessageCommandHandler>(
      CreateMessageCommandHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${CreateMessageCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should create return new message', async () => {
    const command = new CreateMessageCommand(messageDto, MessageSenders.USER);
    const message = await handler.execute(command);
    expect.assertions(5);
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith({
      where: { id: messageDto.userId },
      select: ['id', 'firstName', 'lastName'],
    });
    expect(messageRepository.save).toBeCalledTimes(1);
    expect(messageRepository.save).toBeCalledWith({
      body: messageDto.body,
      user: { id: messageDto.userId },
      type: messageDto.type,
      priority: 1,
      sender: MessageSenders.USER,
    });
    expect(message).toStrictEqual(response);
  });

  it('should throw an internal server error when trying to find user', async () => {
    const message = 'Database error';
    userRepository.findOne = jest.fn().mockRejectedValue(new Error(message));
    const command = new CreateMessageCommand(messageDto, MessageSenders.USER);

    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });

  it('should throw a bad request error when user not found', async () => {
    const message = 'Invalid User';
    userRepository.findOne = jest.fn().mockReturnValue(null);
    const command = new CreateMessageCommand(messageDto, MessageSenders.USER);

    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.BAD_REQUEST),
      );
    }
  });

  it('should throw a bad request error when a different user is found', async () => {
    const message = 'Invalid User';
    userRepository.findOne = jest.fn().mockReturnValue({ id: 5 });
    const command = new CreateMessageCommand(messageDto, MessageSenders.USER);

    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.BAD_REQUEST),
      );
    }
  });

  it('should throw a internal server error when message is not saved', async () => {
    const message = 'Database error';
    userRepository.findOne = jest.fn().mockResolvedValue({ id: 1 });
    messageRepository.save = jest.fn().mockRejectedValue(new Error(message));
    const command = new CreateMessageCommand(messageDto, MessageSenders.USER);

    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });
});
