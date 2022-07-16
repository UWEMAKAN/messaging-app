import { HttpException, HttpStatus } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgentsUsers } from '../../../entities';
import {
  UnassignAllCommand,
  UnassignAllCommandHandler,
} from './unassign-all.command';

describe(UnassignAllCommandHandler.name, () => {
  let handler: UnassignAllCommandHandler;
  let module: TestingModule;

  const agentId = 1;
  const userId = 1;
  const agentsUsersRepository = {
    delete: jest.fn(),
    find: jest.fn(),
  };
  const eventBus = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UnassignAllCommandHandler,
        {
          provide: getRepositoryToken(AgentsUsers),
          useValue: agentsUsersRepository,
        },
        {
          provide: EventBus,
          useValue: eventBus,
        },
      ],
    }).compile();
    handler = module.get<UnassignAllCommandHandler>(UnassignAllCommandHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${UnassignAllCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should unassign all assigned users to an agent', async () => {
    const response = [{ agentId, userId }];
    agentsUsersRepository.find = jest.fn().mockResolvedValue(response);
    const command = new UnassignAllCommand(agentId);
    await handler.execute(command);
    expect.assertions(6);
    expect(agentsUsersRepository.find).toBeCalledTimes(1);
    expect(agentsUsersRepository.find).toBeCalledWith({
      where: { agentId },
      select: ['agentId', 'userId'],
    });
    expect(agentsUsersRepository.delete).toBeCalledTimes(1);
    expect(agentsUsersRepository.delete).toBeCalledWith({ agentId });
    expect(eventBus.publish).toBeCalledTimes(1);
    expect(eventBus.publish).toBeCalledWith({
      agentId,
      assigned: false,
      userId,
    });
  });

  it('should throw database error when finding assignments', async () => {
    const message = 'Database error';
    agentsUsersRepository.find = jest
      .fn()
      .mockRejectedValue(new Error(message));
    const command = new UnassignAllCommand(agentId);
    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(5);
      expect(agentsUsersRepository.find).toBeCalledTimes(1);
      expect(agentsUsersRepository.find).toBeCalledWith({
        where: { agentId },
        select: ['agentId', 'userId'],
      });
      expect(agentsUsersRepository.delete).not.toBeCalledTimes(1);
      expect(eventBus.publish).not.toBeCalledTimes(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });

  it('should throw database error when deleting assignments', async () => {
    const message = 'Database error';
    const response = [{ agentId, userId }];
    agentsUsersRepository.find = jest.fn().mockResolvedValue(response);
    agentsUsersRepository.delete = jest
      .fn()
      .mockRejectedValue(new Error(message));
    const command = new UnassignAllCommand(agentId);
    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(6);
      expect(agentsUsersRepository.find).toBeCalledTimes(1);
      expect(agentsUsersRepository.find).toBeCalledWith({
        where: { agentId },
        select: ['agentId', 'userId'],
      });
      expect(agentsUsersRepository.delete).toBeCalledTimes(1);
      expect(agentsUsersRepository.delete).toBeCalledWith({ agentId });
      expect(eventBus.publish).not.toBeCalledTimes(1);
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });
});
