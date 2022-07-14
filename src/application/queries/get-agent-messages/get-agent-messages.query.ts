import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Stream, Transform } from 'stream';
import { Repository } from 'typeorm';
import { Message } from '../../../entities';
import { fromStream } from '../../../utils';
import { AgentParams, GetMessageResponse, GetMessagesDto } from '../../../dtos';
import { ConnectionService } from '../../../services';
import { map, Observable } from 'rxjs';

export class GetAgentMessagesQuery implements IQuery {
  public readonly agentId: number;
  public readonly messageId: number;
  constructor(dto: GetMessagesDto, param: AgentParams) {
    this.agentId = +param.agentId;
    this.messageId = +dto.messageId;
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
    private readonly connectionService: ConnectionService,
  ) {
    this.logger = new Logger(GetAgentMessagesQueryHandler.name);
  }

  async execute(query: GetAgentMessagesQuery): Promise<Observable<void>> {
    const { messageId, agentId } = query;
    let readStream: Stream = null;

    try {
      const subQuery = this.messageRepository
        .createQueryBuilder('n')
        .select(`MAX(n."id")`)
        .groupBy('n."userId"')
        .getQuery();
      readStream = await this.messageRepository
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
        .where('m."id" > :messageId', { messageId })
        .andWhere(`m."id" IN (${subQuery})`)
        .orderBy('m."priority"', 'ASC')
        .addOrderBy('m."createdAt"', 'DESC')
        .leftJoin('m.user', 'u')
        .limit(50)
        .stream();
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const transformStream = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      },
    });

    transformStream.push('');
    readStream.pipe(transformStream);
    const messages = fromStream<GetMessageResponse>(transformStream);
    const conn = this.connectionService.getAgentConnection(agentId);
    if (conn) {
      return messages.pipe(
        map((message) => {
          if (message) {
            conn.write(`data: ${JSON.stringify(message)}\n\n`);
          }
        }),
      );
    }
  }
}
