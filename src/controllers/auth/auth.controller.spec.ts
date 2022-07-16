import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoginDto } from '../../dtos';
import { Agent, User } from '../../entities';
import { AuthController } from './auth.controller';

const loginDto = {
  email: 'bender@futurama.com',
  password: 'Omicron',
} as LoginDto;

describe('AuthController', () => {
  let controller: AuthController;
  let module: TestingModule;

  const agentRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
  };
  const userRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
  };
  const commandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: getRepositoryToken(Agent), useValue: agentRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: CommandBus,
          useValue: commandBus,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  test('should return userId', async () => {
    const user = await controller.userLogin(loginDto);
    expect.assertions(3);
    expect(userRepository.findOne).toBeCalledTimes(1);
    expect(userRepository.findOne).toBeCalledWith({
      where: { email: loginDto.email },
      select: ['id'],
    });
    expect(user.userId).toBe(1);
  });

  test('should throw an error User not found', async () => {
    const message = 'User not found';
    userRepository.findOne = jest.fn().mockResolvedValue(null);
    try {
      await controller.userLogin(loginDto);
      expect.assertions(3);
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith({
        where: { email: loginDto.email },
        select: ['id'],
      });
      expect(controller.userLogin).toThrowError(new Error(message));
    } catch (err) {
      expect.assertions(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.UNAUTHORIZED),
      );
    }
  });

  test('should throw a database error when finding user', async () => {
    const message = 'database error';
    userRepository.findOne = jest.fn().mockRejectedValue(new Error(message));
    try {
      await controller.userLogin(loginDto);
      expect.assertions(3);
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toBeCalledWith({
        where: { email: loginDto.email },
        select: ['id'],
      });
      expect(controller.userLogin).toThrowError(new Error(message));
    } catch (err) {
      expect.assertions(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });

  test('should return agentId', async () => {
    const agent = await controller.agentLogin(loginDto);
    expect.assertions(3);
    expect(agentRepository.findOne).toBeCalledTimes(1);
    expect(agentRepository.findOne).toBeCalledWith({
      where: { email: loginDto.email },
      select: ['id'],
    });
    expect(agent.agentId).toBe(1);
  });

  test('should throw an error Agent not found', async () => {
    const message = 'Agent not found';
    agentRepository.findOne = jest.fn().mockResolvedValue(null);
    try {
      await controller.agentLogin(loginDto);
      expect.assertions(3);
      expect(agentRepository.findOne).toBeCalledTimes(1);
      expect(agentRepository.findOne).toBeCalledWith({
        where: { email: loginDto.email },
        select: ['id'],
      });
      expect(controller.agentLogin).toThrowError(new Error(message));
    } catch (err) {
      expect.assertions(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.UNAUTHORIZED),
      );
    }
  });

  test('should throw database error when finding agent', async () => {
    const message = 'database error';
    agentRepository.findOne = jest.fn().mockRejectedValue(new Error(message));
    try {
      await controller.agentLogin(loginDto);
      expect.assertions(3);
      expect(agentRepository.findOne).toBeCalledTimes(1);
      expect(agentRepository.findOne).toBeCalledWith({
        where: { email: loginDto.email },
        select: ['id'],
      });
      expect(controller.agentLogin).toThrowError(new Error(message));
    } catch (err) {
      expect.assertions(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });

  test('should call delete on assigned tickets', async () => {
    const logoutDto = { agentId: 1 };
    await controller.logoutAgent(logoutDto);
    expect.assertions(2);
    expect(commandBus.execute).toBeCalledTimes(1);
    expect(commandBus.execute).toBeCalledWith({ agentId: 1 });
  });
});
