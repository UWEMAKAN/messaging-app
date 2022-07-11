import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AgentsUsers } from '../../../entities';
import {
  UnassignAgentCommand,
  UnassignAgentCommandHandler,
} from './unassign-agent.command';

describe(UnassignAgentCommandHandler.name, () => {
  let handler: UnassignAgentCommandHandler;
  let module: TestingModule;

  const agentsUsersRepository = {
    delete: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UnassignAgentCommandHandler,
        {
          provide: getRepositoryToken(AgentsUsers),
          useValue: agentsUsersRepository,
        },
      ],
    }).compile();
    handler = module.get<UnassignAgentCommandHandler>(
      UnassignAgentCommandHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${UnassignAgentCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  it('should unassign user from agent', async () => {
    const agentId = 1;
    const userId = 1;
    agentsUsersRepository.delete = jest
      .fn()
      .mockReturnValue({ affected: 1, raw: {} });
    const command = new UnassignAgentCommand({ agentId, userId });
    await handler.execute(command);
    expect.assertions(2);
    expect(agentsUsersRepository.delete).toBeCalledTimes(1);
    expect(agentsUsersRepository.delete).toBeCalledWith({ agentId, userId });
  });

  it('should throw database error when trying to delete record', async () => {
    const message = 'Database error';
    const agentId = 1;
    const userId = 1;
    agentsUsersRepository.delete = jest
      .fn()
      .mockRejectedValue(new Error(message));
    const command = new UnassignAgentCommand({ agentId, userId });

    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(3);
      expect(agentsUsersRepository.delete).toBeCalledTimes(1);
      expect(agentsUsersRepository.delete).toBeCalledWith({ agentId, userId });
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  });

  it('should throw bad request error when trying to delete record', async () => {
    const message = 'Record not found';
    const agentId = 1;
    const userId = 1;
    agentsUsersRepository.delete = jest
      .fn()
      .mockReturnValue({ affected: 0, raw: {} });
    const command = new UnassignAgentCommand({ agentId, userId });

    try {
      await handler.execute(command);
    } catch (err) {
      expect.assertions(3);
      expect(agentsUsersRepository.delete).toBeCalledTimes(1);
      expect(agentsUsersRepository.delete).toBeCalledWith({ agentId, userId });
      expect(err).toStrictEqual(
        new HttpException(message, HttpStatus.BAD_REQUEST),
      );
    }
  });
});
