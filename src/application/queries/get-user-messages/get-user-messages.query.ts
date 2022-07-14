import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../../entities';

export class GetUserMessagesQuery implements IQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetUserMessagesQuery)
export class GetUserMessagesQueryHandler
  implements IQueryHandler<GetUserMessagesQuery>
{
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {
    this.logger = new Logger(GetUserMessagesQueryHandler.name);
  }

  async execute(query: GetUserMessagesQuery): Promise<Message[]> {
    const { userId } = query;
    try {
      return await this.messageRepository
        .createQueryBuilder()
        .where(`"userId" = :userId`, { userId })
        .orderBy(`"createdAt"`, 'ASC')
        .select([
          '"id"',
          '"userId"',
          '"type"',
          '"createdAt"',
          '"body"',
          '"sender"',
        ])
        .getMany();
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
