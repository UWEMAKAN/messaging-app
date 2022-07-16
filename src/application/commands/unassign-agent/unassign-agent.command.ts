import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CloseConversationDto } from '../../../dtos';
import { AgentsUsers } from '../../../entities';
import { AgentAssignmentEvent } from '../../events';

export class UnassignAgentCommand implements ICommand {
  constructor(public readonly data: CloseConversationDto) {}
}

@CommandHandler(UnassignAgentCommand)
export class UnassignAgentCommandHandler
  implements ICommandHandler<UnassignAgentCommand>
{
  private readonly logger: Logger = new Logger(UnassignAgentCommand.name);

  constructor(
    @InjectRepository(AgentsUsers)
    private readonly agentsUsersRepository: Repository<AgentsUsers>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UnassignAgentCommand): Promise<void> {
    const { agentId, userId } = command.data;
    let deleteResult: DeleteResult = null;

    try {
      deleteResult = await this.agentsUsersRepository.delete({
        userId,
        agentId,
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!deleteResult.affected) {
      throw new HttpException('Record not found', HttpStatus.BAD_REQUEST);
    }

    this.eventBus.publish(new AgentAssignmentEvent(agentId, false, userId));
  }
}
