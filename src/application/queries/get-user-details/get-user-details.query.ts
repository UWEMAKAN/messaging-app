import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities';

export class GetUserDetailsQuery implements IQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetUserDetailsQuery)
export class GetUserDetailsQueryHandler
  implements IQueryHandler<GetUserDetailsQuery>
{
  private readonly logger = new Logger(GetUserDetailsQueryHandler.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetUserDetailsQuery): Promise<User> {
    const { userId } = query;
    let user: User = null;
    try {
      user = await this.userRepository.findOne({
        where: { id: userId },
        relations: {
          messages: {
            id: true,
            body: true,
            type: true,
            sender: true,
            createdAt: true,
            priority: true,
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          messages: true,
        },
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}
