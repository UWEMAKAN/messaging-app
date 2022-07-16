import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import {
  CreateMessageCommand,
  CreateUserCommand,
  GetUserDetailsQuery,
  GetUserMessagesQuery,
  SendMessageToAgentsEvent,
  UnassignAgentCommand,
} from '../../application';
import {
  CreateMessageDto,
  CreateMessageResponse,
  CreateUserDto,
  CreateUserResponse,
  GetMessageResponse,
  UserDetailsResponse,
  UserParams,
} from '../../dtos';
import { AgentsUsers } from '../../entities';
import { ConnectionService } from '../../services';
import { MessageSenders } from '../../utils';

@Controller('users')
export class UsersController {
  private readonly logger: Logger;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
    private readonly connectionService: ConnectionService,
    @InjectRepository(AgentsUsers)
    private readonly agentsUsersRepository: Repository<AgentsUsers>,
  ) {
    this.logger = new Logger(UsersController.name);
  }

  /**
   * Endpoint to create a new user
   * @param dto CreateUserDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto): Promise<CreateUserResponse> {
    this.logger.log('createUser');
    return await this.commandBus.execute(new CreateUserCommand(dto));
  }

  /**
   * Endpoint to send messages from a user
   * @param dto CreateMessageDto
   */
  @Post('/messages')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body() dto: CreateMessageDto,
  ): Promise<CreateMessageResponse> {
    this.logger.log('sendMessage');
    const message: CreateMessageResponse = await this.commandBus.execute(
      new CreateMessageCommand(dto, MessageSenders.USER),
    );
    this.eventBus.publish(new SendMessageToAgentsEvent(message));
    return {
      id: message.id,
      userId: message.userId,
      body: message.body,
      sender: message.sender,
      type: message.type,
      createdAt: message.createdAt,
    };
  }

  /**
   * Endpoint for user to subscribe to new messages
   * @param userParam UserParams
   */
  @Get('/:userId/subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(
    @Param() userParam: UserParams,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.logger.log('subscribe user');
    const userId = +userParam.userId;
    req.on('close', () => {
      this.connectionService.removeUserConnection(userId);
      this.logger.log(`User ${userId} disconnected`);
      setTimeout(async () => {
        const conn = this.connectionService.getUserConnection(userId);
        if (!conn) {
          const agentUser = await this.agentsUsersRepository.findOne({
            where: { userId },
            select: ['agentId'],
          });
          if (agentUser) {
            await this.commandBus.execute(
              new UnassignAgentCommand({ userId, agentId: agentUser.agentId }),
            );
          }
        }
      }, 10000);
    });
    res.setHeader('Content-Type', 'text/event-stream');
    this.connectionService.setUserConnection(+userParam.userId, res);
  }

  /**
   * Endpoint to fetch user messages
   * @param userParam UserParams
   */
  @Get('/:userId/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Param() userParam: UserParams,
  ): Promise<GetMessageResponse[]> {
    return await this.queryBus.execute(
      new GetUserMessagesQuery(+userParam.userId),
    );
  }

  /**
   * Endpoint to fetch user details
   * @param userParam UserParams
   */
  @Get('/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserDetails(
    @Param() userParam: UserParams,
  ): Promise<UserDetailsResponse> {
    return await this.queryBus.execute(
      new GetUserDetailsQuery(+userParam.userId),
    );
  }
}
