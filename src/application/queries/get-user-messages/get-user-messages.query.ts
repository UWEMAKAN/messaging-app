import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { map, Observable } from 'rxjs';
import { Readable, Transform } from 'stream';
import { Repository } from 'typeorm';
import { Message } from '../../../entities';
import { fromStream } from '../../../utils';
import { GetMessagesDto, UserParams, GetMessageResponse } from '../../../dtos';
import { ConnectionService } from '../../../services';

export class GetUserMessagesQuery implements IQuery {
  public readonly userId: number;
  public readonly messageId: number;
  constructor(dto: GetMessagesDto, param: UserParams) {
    this.userId = +param.userId;
    this.messageId = +dto.messageId;
  }
}

@QueryHandler(GetUserMessagesQuery)
export class GetUserMessagesQueryHandler
  implements IQueryHandler<GetUserMessagesQuery>
{
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly connectionService: ConnectionService,
  ) {
    this.logger = new Logger(GetUserMessagesQueryHandler.name);
  }

  async execute(query: GetUserMessagesQuery): Promise<Observable<void>> {
    const { userId, messageId } = query;
    let readStream: Readable = null;

    try {
      readStream = await this.messageRepository
        .createQueryBuilder()
        .where('id > :messageId', { messageId })
        .andWhere(`"userId" = :userId`, { userId })
        .orderBy(`"createdAt"`, 'ASC')
        .select([
          '"id"',
          '"userId"',
          '"type"',
          '"createdAt"',
          '"body"',
          '"sender"',
        ])
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
    const conn = this.connectionService.getUserConnection(userId);
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
