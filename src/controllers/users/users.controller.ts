import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import {
  CreateMessageCommand,
  CreateUserCommand,
  GetUserDetailsQuery,
  GetUserMessagesQuery,
  SendMessageToAgentsEvent,
} from '../../application';
import {
  CreateMessageDto,
  CreateMessageResponse,
  CreateUserDto,
  CreateUserResponse,
  GetMessageResponse,
  GetMessagesDto,
  UserDetailsResponse,
  UserParams,
} from '../../dtos';
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
  ) {
    this.logger = new Logger(UsersController.name);
  }

  /**
   * Endpoint to create a new user
   * @param dto CreateUserDto
   * @returns CreateUserResponse
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
   * @returns CreateMessageResponse
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
    delete message.priority;
    return message;
  }

  /**
   * Endpoint to stream messages to the user
   * @param dto GetMessagesDto
   * @param userParam UserParams
   * @returns GetMessageResponse
   */
  @Get('/:userId/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Query() dto: GetMessagesDto,
    @Param() userParam: UserParams,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<GetMessageResponse> {
    req.on('close', () => {
      this.connectionService.removeUserConnection(+userParam.userId);
      this.logger.log(`User ${userParam.userId} disconnected`);
    });
    res.setHeader('Content-Type', 'text/event-stream');
    this.connectionService.setUserConnection(+userParam.userId, res);
    if (dto.messageId !== undefined) {
      return await this.queryBus.execute(
        new GetUserMessagesQuery(dto, userParam),
      );
    }
  }

  /**
   * Endpoint to fetch user details
   * @param userParam UserParams
   * @returns UserDetailsResponse
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
