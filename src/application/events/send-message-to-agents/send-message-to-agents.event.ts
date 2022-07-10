import { Logger } from '@nestjs/common';
import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { CreateMessageResponse } from '../../../dtos';
import { ConnectionService } from '../../../services';

export class SendMessageToAgentsEvent implements IEvent {
  constructor(
    public readonly message: CreateMessageResponse,
    public readonly agentId?: number,
  ) {}
}

@EventsHandler(SendMessageToAgentsEvent)
export class SendMessageToAgentsEventHandler
  implements IEventHandler<SendMessageToAgentsEvent>
{
  private readonly logger: Logger = new Logger(
    SendMessageToAgentsEventHandler.name,
  );

  constructor(private readonly connectionService: ConnectionService) {}

  handle(event: SendMessageToAgentsEvent) {
    const agentConns = this.connectionService.getAgentConnections();
    agentConns.forEach(([agentId, conn]) => {
      if (agentId !== event.agentId) {
        conn.write(`data: ${JSON.stringify(event.message)}\n\n`);
      }
    });
  }
}
