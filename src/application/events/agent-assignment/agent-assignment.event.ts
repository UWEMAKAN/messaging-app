import { Logger } from '@nestjs/common';
import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { ConnectionService } from '../../../services';

export class AgentAssignmentEvent implements IEvent {
  constructor(
    public readonly agentId: number,
    public readonly assigned: boolean,
    public readonly userId: number,
  ) {}
}

@EventsHandler(AgentAssignmentEvent)
export class AgentAssignmentEventHandler
  implements IEventHandler<AgentAssignmentEvent>
{
  private readonly logger = new Logger(AgentAssignmentEventHandler.name);

  constructor(private readonly connectionService: ConnectionService) {}

  handle(event: AgentAssignmentEvent) {
    this.logger.log('Send assignment to agent');
    const { agentId, assigned, userId } = event;
    const conn = this.connectionService.getAgentConnection(agentId);
    if (conn) {
      conn.write(
        `event: assignment data: ${JSON.stringify({ assigned, userId })}\n\n`,
      );
    }
  }
}
