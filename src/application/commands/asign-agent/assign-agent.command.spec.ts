import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgentsUsers } from '../../../entities';
import {
  AssignAgentCommand,
  AssignAgentCommandHandler,
} from './assign-agent.command';

describe(AssignAgentCommandHandler.name, () => {
  let handler: AssignAgentCommandHandler;
  let module: TestingModule;

  const agentsUsersRepository = {
    findOne: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AssignAgentCommandHandler,
        {
          provide: getRepositoryToken(AgentsUsers),
          useValue: agentsUsersRepository,
        },
      ],
    }).compile();
    handler = module.get<AssignAgentCommandHandler>(AssignAgentCommandHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${AssignAgentCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should assign user to agent', async () => {
    const agentId = 1;
    const userId = 1;
    agentsUsersRepository.findOne = jest.fn().mockResolvedValue(null);
    const command = new AssignAgentCommand(agentId, userId);
    await handler.execute(command);
    expect.assertions(4);
    expect(agentsUsersRepository.findOne).toBeCalledTimes(1);
    expect(agentsUsersRepository.findOne).toBeCalledWith({
      where: { userId },
      select: ['agentId'],
    });
    expect(agentsUsersRepository.insert).toBeCalledTimes(1);
    expect(agentsUsersRepository.insert).toBeCalledWith({ agentId, userId });
  });

  it('should throw a database error when finding agents_users record', async () => {
    const message = 'Database error';
    const agentId = 1;
    const userId = 1;
    agentsUsersRepository.findOne = jest
      .fn()
      .mockRejectedValue(new Error(message));
    const command = new AssignAgentCommand(agentId, userId);
    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(3);
      expect(agentsUsersRepository.findOne).toBeCalledTimes(1);
      expect(agentsUsersRepository.findOne).toBeCalledWith({
        where: { userId },
        select: ['agentId'],
      });
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });

  it('should throw a database error when inserting agents_users record', async () => {
    const message = 'Database error';
    const agentId = 1;
    const userId = 1;
    agentsUsersRepository.findOne = jest.fn().mockResolvedValue(null);
    agentsUsersRepository.insert = jest
      .fn()
      .mockRejectedValue(new Error(message));
    const command = new AssignAgentCommand(agentId, userId);
    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(5);
      expect(agentsUsersRepository.findOne).toBeCalledTimes(1);
      expect(agentsUsersRepository.findOne).toBeCalledWith({
        where: { userId },
        select: ['agentId'],
      });
      expect(agentsUsersRepository.insert).toBeCalledTimes(1);
      expect(agentsUsersRepository.insert).toBeCalledWith({ agentId, userId });
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });

  it('should throw a user already assigned bad request error when assigning user to agent', async () => {
    const message = 'User already assigned';
    const agentId = 1;
    const userId = 1;
    agentsUsersRepository.findOne = jest.fn().mockResolvedValue({ agentId: 2 });
    agentsUsersRepository.insert = jest
      .fn()
      .mockRejectedValue(new Error(message));
    const command = new AssignAgentCommand(agentId, userId);
    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(3);
      expect(agentsUsersRepository.findOne).toBeCalledTimes(1);
      expect(agentsUsersRepository.findOne).toBeCalledWith({
        where: { userId },
        select: ['agentId'],
      });
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.BAD_REQUEST),
      );
    }
  });

  it('should do nothing if user is already assigned to agent', async () => {
    const message = 'User already assigned';
    const agentId = 1;
    const userId = 1;
    agentsUsersRepository.findOne = jest.fn().mockResolvedValue({ agentId: 1 });
    agentsUsersRepository.insert = jest
      .fn()
      .mockRejectedValue(new Error(message));
    const command = new AssignAgentCommand(agentId, userId);
    await handler.execute(command);
    expect.assertions(2);
    expect(agentsUsersRepository.findOne).toBeCalledTimes(1);
    expect(agentsUsersRepository.findOne).toBeCalledWith({
      where: { userId },
      select: ['agentId'],
    });
  });
});
