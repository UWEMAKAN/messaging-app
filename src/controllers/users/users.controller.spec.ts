import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../../dtos';
import { UsersController } from './users.controller';

const createUserDto = {
  email: 'found@example.com',
  firstName: 'Found',
  lastName: 'Example',
  password: 'Password',
} as CreateUserDto;

describe(UsersController.name, () => {
  let controller: UsersController;
  let module: TestingModule;
  const commandBus = {
    execute: jest.fn().mockResolvedValue({ ...createUserDto, id: 1 }),
  } as unknown as CommandBus;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: CommandBus, useValue: commandBus }],
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

  test('should call commandBus', async () => {
    const user = await controller.createUser(createUserDto);
    expect.assertions(2);
    expect(commandBus.execute).toBeCalledTimes(1);
    expect(user).toStrictEqual({ ...createUserDto, id: 1 });
  });
});
