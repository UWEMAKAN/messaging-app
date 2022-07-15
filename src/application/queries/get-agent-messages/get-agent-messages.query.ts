import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../../entities';
import { Duration } from '../../../utils';
import { GetMessageResponse, GetMessagesDto } from '../../../dtos';

export class GetAgentMessagesQuery implements IQuery {
  public readonly duration: number;
  constructor(dto: GetMessagesDto) {
    this.duration = Duration[dto.duration];
  }
}

@QueryHandler(GetAgentMessagesQuery)
export class GetAgentMessagesQueryHandler
  implements IQueryHandler<GetAgentMessagesQuery>
{
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {
    this.logger = new Logger(GetAgentMessagesQueryHandler.name);
  }

  async execute(query: GetAgentMessagesQuery): Promise<GetMessageResponse[]> {
    const { duration } = query;
    try {
      const subQuery = this.messageRepository
        .createQueryBuilder('n')
        .select(`MAX(n."id")`)
        .groupBy('n."userId"')
        .getQuery();
      return await this.messageRepository
        .createQueryBuilder('m')
        .select([
          'm."id"',
          'm."userId"',
          'm."type"',
          'm."body"',
          'm."sender"',
          'm."priority"',
          'm."createdAt"',
          'u."firstName"',
          'u."lastName"',
        ])
        .where(`m."createdAt" > (CURRENT_DATE - ${duration})`)
        .andWhere(`m."id" IN (${subQuery})`)
        .orderBy('m."priority"', 'ASC')
        .addOrderBy('m."createdAt"', 'DESC')
        .leftJoin('m.user', 'u')
        .getRawMany();
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
