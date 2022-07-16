import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionService } from '../../../services';
import {
  PushStockMessagesEvent,
  PushStockMessagesEventHandler,
} from './push-stock-messages.event';

describe(PushStockMessagesEventHandler.name, () => {
  let handler: PushStockMessagesEventHandler;
  let module: TestingModule;

  const conn = {
    write: jest.fn(),
  };
  const connectionService = {
    getAgentConnections: jest.fn().mockReturnValue([[1, conn]]),
  } as unknown as ConnectionService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        PushStockMessagesEventHandler,
        { provide: ConnectionService, useValue: connectionService },
      ],
    }).compile();
    handler = module.get<PushStockMessagesEventHandler>(
      PushStockMessagesEventHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it(`${PushStockMessagesEventHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  test('should call handler.handle', () => {
    const messages = [{ id: 1, text: 'How may I be of service?' }];
    const event = new PushStockMessagesEvent(messages);
    handler.handle(event);
    expect.assertions(2);
    expect(connectionService.getAgentConnections).toBeCalledTimes(1);
    expect(conn.write).toBeCalledTimes(1);
  });
});
