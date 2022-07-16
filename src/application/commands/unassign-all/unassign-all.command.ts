import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentsUsers } from '../../../entities';
import { AgentAssignmentEvent } from '../../events';

export class UnassignAllCommand implements ICommand {
  constructor(public readonly agentId: number) {}
}

@CommandHandler(UnassignAllCommand)
export class UnassignAllCommandHandler
  implements ICommandHandler<UnassignAllCommand>
{
  private readonly logger = new Logger(UnassignAllCommandHandler.name);

  constructor(
    @InjectRepository(AgentsUsers)
    private readonly agentsUsersRepository: Repository<AgentsUsers>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UnassignAllCommand): Promise<any> {
    let assignments: AgentsUsers[] = [];
    try {
      assignments = await this.agentsUsersRepository.find({
        where: { agentId: command.agentId },
        select: ['agentId', 'userId'],
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      await this.agentsUsersRepository.delete({
        agentId: command.agentId,
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    for (const assignment of assignments) {
      this.eventBus.publish(
        new AgentAssignmentEvent(assignment.agentId, false, assignment.userId),
      );
    }
  }
}
