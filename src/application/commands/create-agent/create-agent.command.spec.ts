import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateAgentDto } from '../../../dtos';
import { Agent } from '../../../entities';
import { PasswordService } from '../../../services';
import {
  CreateAgentCommand,
  CreateAgentCommandHandler,
} from './create-agent.command';

const createAgentDto = {
  email: 'found@example.com',
  firstName: 'Found',
  lastName: 'Example',
  password: 'Password',
} as CreateAgentDto;

describe(CreateAgentCommandHandler.name, () => {
  let handler: CreateAgentCommandHandler;
  let module: TestingModule;

  const agentRepository = {
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockResolvedValue({ ...createAgentDto, id: 2 }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CreateAgentCommandHandler,
        PasswordService,
        { provide: getRepositoryToken(Agent), useValue: agentRepository },
      ],
    }).compile();

    handler = module.get<CreateAgentCommandHandler>(CreateAgentCommandHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${CreateAgentCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create a agent successfully and return a agentId', async () => {
      const command = new CreateAgentCommand(createAgentDto);
      const { agentId } = await handler.execute(command);
      expect.assertions(3);
      expect(agentRepository.findOne).toBeCalledTimes(1);
      expect(agentRepository.save).toBeCalledTimes(1);
      expect(agentId).toBe(2);
    });

    it('should fail to find a agent because of a connection error', async () => {
      const message = 'connection error';
      agentRepository.findOne = jest.fn().mockRejectedValue(new Error(message));
      const command = new CreateAgentCommand(createAgentDto);
      try {
        await handler.execute(command);
        expect.assertions(4);
        expect(agentRepository.findOne).toBeCalledTimes(1);
        expect(agentRepository.save).not.toBeCalled();
        expect(agentRepository.findOne).toThrowError(new Error(message));
        expect(handler.execute).toThrowError(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });

    it('should fail to create a agent and throw an error agent already exists', async () => {
      const message = 'agent already exists';
      agentRepository.findOne = jest
        .fn()
        .mockResolvedValue({ ...createAgentDto, id: 1 });
      const command = new CreateAgentCommand(createAgentDto);
      try {
        await handler.execute(command);
        expect.assertions(3);
        expect(agentRepository.findOne).toBeCalledTimes(1);
        expect(agentRepository.save).not.toBeCalled();
        expect(handler.execute).toThrowError(message);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
      }
    });

    it('should fail to save a agent because of a connection error', async () => {
      const message = 'connection error';
      agentRepository.findOne = jest.fn().mockResolvedValue(null);
      agentRepository.save = jest.fn().mockRejectedValue(new Error(message));
      const command = new CreateAgentCommand(createAgentDto);
      try {
        await handler.execute(command);
        expect.assertions(3);
        expect(agentRepository.findOne).toBeCalledTimes(1);
        expect(agentRepository.save).toBeCalledTimes(1);
        expect(handler.execute).toThrowError('connection error');
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });
  });
});
