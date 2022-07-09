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
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateMessageCommand,
  CreateUserCommand,
  GetUserMessagesQuery,
  SendUserMessageEvent,
} from '../../application';
import {
  CreateMessageDto,
  CreateMessageResponse,
  CreateUserDto,
  CreateUserResponse,
  GetMessageResponse,
  GetUserMessagesDto,
  UserParams,
} from '../../dtos';
import { ConnectionInterceptor } from '../../utils';

@Controller('users')
export class UsersController {
  private readonly logger: Logger;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
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
      new CreateMessageCommand(dto),
    );
    this.eventBus.publish(new SendUserMessageEvent(message));
    delete message.priority;
    return message;
  }

  /**
   * Endpoint to stream user's messages to the user
   * @param dto GetUserMessagesDto
   * @param userParam UserParams
   */
  @Get('/:userId/messages')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ConnectionInterceptor)
  async getMessages(
    @Query() dto: GetUserMessagesDto,
    @Param() userParam: UserParams,
  ): Promise<GetMessageResponse> {
    if (dto.messageId !== undefined) {
      return await this.queryBus.execute(
        new GetUserMessagesQuery(dto, userParam),
      );
    }
  }
}
