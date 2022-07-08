import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAgentCommand } from '../../application';
import { CreateAgentDto } from '../../dtos';
import { AgentsController } from './agents.controller';

const createAgentDto = {
  email: 'found@example.com',
  firstName: 'Found',
  lastName: 'Example',
  password: 'Password',
} as CreateAgentDto;

describe('AgentsController', () => {
  let controller: AgentsController;
  let module: TestingModule;
  const commandBus = {
    execute: jest.fn().mockResolvedValue({ ...createAgentDto, id: 1 }),
  } as unknown as CommandBus;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [{ provide: CommandBus, useValue: commandBus }],
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
    const agent = await controller.createAgent(createAgentDto);
    expect.assertions(3);
    expect(commandBus.execute).toBeCalledTimes(1);
    expect(commandBus.execute).toBeCalledWith(
      new CreateAgentCommand(createAgentDto),
    );
    expect(agent).toStrictEqual({ ...createAgentDto, id: 1 });
  });
});
