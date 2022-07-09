import { Logger } from '@nestjs/common';
import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { Response } from 'express';
import { CreateMessageResponse } from '../../../dtos';
import { ConnectionService } from '../../../services';

export class SendUserMessageEvent implements IEvent {
  constructor(public readonly message: CreateMessageResponse) {}
}

@EventsHandler(SendUserMessageEvent)
export class SendUserMessageEventHandler
  implements IEventHandler<SendUserMessageEvent>
{
  private readonly logger: Logger = new Logger(
    SendUserMessageEventHandler.name,
  );

  constructor(private readonly connectionService: ConnectionService) {}

  handle(event: SendUserMessageEvent) {
    const agentConns = this.connectionService.getAgentConnections();
    agentConns.forEach((conn: [number, Response]) => {
      const sent = conn[1].write(`data: ${JSON.stringify(event.message)}\n\n`);
      if (!sent) {
        this.logger.log(`Agent with id ${conn[0]} disconnected`);
        this.connectionService.removeAgentConnection(conn[0]);
      }
    });
  }
}
