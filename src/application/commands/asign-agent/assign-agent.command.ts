import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentsUsers } from '../../../entities';

export class AssignAgentCommand implements ICommand {
  constructor(
    public readonly agentId: number,
    public readonly userId: number,
  ) {}
}

@CommandHandler(AssignAgentCommand)
export class AssignAgentCommandHandler
  implements ICommandHandler<AssignAgentCommand>
{
  private readonly logger: Logger = new Logger(AssignAgentCommandHandler.name);

  constructor(
    @InjectRepository(AgentsUsers)
    private readonly agentsUsersRepository: Repository<AgentsUsers>,
  ) {}

  async execute(command: AssignAgentCommand): Promise<void> {
    const { agentId, userId } = command;
    let agentUser: AgentsUsers = null;

    try {
      agentUser = await this.agentsUsersRepository.findOne({
        where: { userId },
        select: ['agentId'],
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!agentUser) {
      try {
        await this.agentsUsersRepository.insert({ agentId, userId });
      } catch (err) {
        this.logger.log(JSON.stringify(err));
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } else if (agentUser.agentId !== agentId) {
      throw new HttpException('User already assigned', HttpStatus.BAD_REQUEST);
    }
  }
}
