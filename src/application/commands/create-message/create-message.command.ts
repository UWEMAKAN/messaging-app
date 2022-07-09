import { ICommand } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, User } from '../../../entities';
import { CreateMessageDto, CreateMessageResponse } from '../../../dtos';
import { getMessagePriority, MessageSenders } from '../../../utils';

export class CreateMessageCommand implements ICommand {
  constructor(
    public readonly data: CreateMessageDto,
    public readonly sender: MessageSenders,
  ) {}
}

@CommandHandler(CreateMessageCommand)
export class CreateMessageCommandHandler
  implements ICommandHandler<CreateMessageCommand>
{
  private readonly logger: Logger;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {
    this.logger = new Logger(CreateMessageCommandHandler.name);
  }

  async execute(command: CreateMessageCommand): Promise<CreateMessageResponse> {
    let user: User = null;
    let message: Message = null;

    try {
      user = await this.userRepository.findOne({
        where: { id: command.data.userId },
        select: ['id'],
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (user === null || user.id !== command.data.userId) {
      throw new HttpException('Invalid User', HttpStatus.BAD_REQUEST);
    }

    const priorityLevel = getMessagePriority(command.data.body);

    try {
      message = await this.messageRepository.save({
        body: command.data.body,
        user: { id: command.data.userId },
        type: command.data.type,
        priority: priorityLevel,
        sender: command.sender,
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { body, type, createdAt, id, priority, sender } = message;

    return {
      id,
      body,
      userId: user.id,
      type,
      createdAt: createdAt.toString(),
      priority,
      sender,
    };
  }
}
