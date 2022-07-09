import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../../../dtos';
import { User } from '../../../entities';
import { PasswordService } from '../../../services';
import {
  CreateUserCommand,
  CreateUserCommandHandler,
} from './create-user.command';

const createUserDto = {
  email: 'found@example.com',
  firstName: 'Found',
  lastName: 'Example',
  password: 'Password',
} as CreateUserDto;

describe(CreateUserCommandHandler.name, () => {
  let handler: CreateUserCommandHandler;
  let module: TestingModule;

  const userRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue({ ...createUserDto, id: 2 }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CreateUserCommandHandler,
        PasswordService,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    handler = module.get<CreateUserCommandHandler>(CreateUserCommandHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${CreateUserCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create a user successfully and return a userId', async () => {
      const command = new CreateUserCommand(createUserDto);
      const { userId } = await handler.execute(command);
      expect.assertions(3);
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.save).toBeCalledTimes(1);
      expect(userId).toBe(2);
    });

    it('should fail to find a user because of a connection error', async () => {
      const message = 'connection error';
      userRepository.findOne = jest.fn().mockRejectedValue(new Error(message));
      const command = new CreateUserCommand(createUserDto);
      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });

    it('should fail to create a user and throw an error user already exists', async () => {
      const message = 'user already exists';
      userRepository.findOne = jest
        .fn()
        .mockResolvedValue({ ...createUserDto, id: 1 });
      const command = new CreateUserCommand(createUserDto);
      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
      }
    });

    it('should fail to save a user because of a connection error', async () => {
      const message = 'connection error';
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      userRepository.save = jest.fn().mockRejectedValue(new Error(message));
      const command = new CreateUserCommand(createUserDto);
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
});
