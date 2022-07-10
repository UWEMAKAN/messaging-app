import { Logger } from '@nestjs/common';
import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { CreateMessageResponse } from '../../../dtos';
import { ConnectionService } from '../../../services';

export class SendMessageToUserEvent implements IEvent {
  constructor(public readonly message: CreateMessageResponse) {}
}

@EventsHandler(SendMessageToUserEvent)
export class SendMessageToUserEventHandler
  implements IEventHandler<SendMessageToUserEvent>
{
  private readonly logger: Logger;

  constructor(private readonly connectionService: ConnectionService) {
    this.logger = new Logger(SendMessageToUserEventHandler.name);
  }

  async handle(event: SendMessageToUserEvent) {
    this.logger.log('Handling SendMessageToUserEvent');
    const conn = this.connectionService.getUserConnection(event.message.userId);
    if (conn) {
      conn.write(`data: ${JSON.stringify(event.message)}\n\n`);
    }
  }
}
