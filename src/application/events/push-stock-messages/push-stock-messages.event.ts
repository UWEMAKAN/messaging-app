import { Logger } from '@nestjs/common';
import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { StockMessage } from '../../../entities';
import { ConnectionService } from '../../../services';

export class PushStockMessagesEvent implements IEvent {
  constructor(public readonly messages: StockMessage[]) {}
}

@EventsHandler(PushStockMessagesEvent)
export class PushStockMessagesEventHandler
  implements IEventHandler<PushStockMessagesEvent>
{
  private readonly logger = new Logger(PushStockMessagesEventHandler.name);

  constructor(private readonly connectionService: ConnectionService) {}
  handle(event: PushStockMessagesEvent) {
    this.logger.log('Sending stock messages to agents');
    const agentConns = this.connectionService.getAgentConnections();
    agentConns.forEach((conn) => {
      conn[1].write(
        `event: stock-message\ndata: ${JSON.stringify(event.messages)}\n\n`,
      );
    });
  }
}
