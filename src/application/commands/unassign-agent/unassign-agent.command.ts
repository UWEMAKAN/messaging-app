import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { CloseConversationDto, CloseConversationResponse } from '../../../dtos';
import { AgentsUsers } from '../../../entities';

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
  ) {}

  async execute(
    command: UnassignAgentCommand,
  ): Promise<CloseConversationResponse> {
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

    return { closed: true };
  }
}
