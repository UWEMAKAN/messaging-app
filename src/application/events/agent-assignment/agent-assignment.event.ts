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
    this.logger.log('Send assignment to all agents');
    const agentConns = this.connectionService.getAgentConnections();
    agentConns.forEach((conn) => {
      conn[1].write(`event: assignment data: ${JSON.stringify(event)}\n\n`);
    });
  }
}
