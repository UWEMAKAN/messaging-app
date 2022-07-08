import { Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../../../entities';
import { PasswordService } from '../../../services';
import { CreateAgentDto } from '../../../dtos';

export class CreateAgentCommand implements ICommand {
  constructor(public readonly data: CreateAgentDto) {}
}

@CommandHandler(CreateAgentCommand)
export class CreateAgentCommandHandler
  implements ICommandHandler<CreateAgentCommand>
{
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    private readonly passwordService: PasswordService,
  ) {
    this.logger = new Logger(CreateAgentCommandHandler.name);
  }

  async execute(command: CreateAgentCommand): Promise<any> {
    let agent: Agent = null;

    try {
      agent = await this.agentRepository.findOne({
        where: { email: command.data.email },
        select: ['id'],
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (agent) {
      throw new HttpException('agent already exists', HttpStatus.BAD_REQUEST);
    }

    const { passwordHash, salt } = this.passwordService.hashPassword(
      command.data.password,
    );

    try {
      agent = await this.agentRepository.save({
        firstName: command.data.firstName,
        lastName: command.data.lastName,
        email: command.data.email,
        hashedPassword: passwordHash,
        passwordSalt: salt,
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { agentId: +agent.id };
  }
}
