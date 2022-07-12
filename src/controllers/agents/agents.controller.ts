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
  AssignAgentCommand,
  CreateAgentCommand,
  CreateMessageCommand,
  GetAgentMessagesQuery,
  SendMessageToAgentsEvent,
  SendMessageToUserEvent,
  UnassignAgentCommand,
} from '../../application';
import {
  AgentParams,
  CloseConversationDto,
  CreateAgentDto,
  CreateAgentMessageDto,
  CreateAgentResponse,
  CreateMessageResponse,
  GetMessageResponse,
  GetMessagesDto,
} from '../../dtos';
import { ConnectionService } from '../../services';
import { MessageSenders } from '../../utils';

@Controller('agents')
export class AgentsController {
  private readonly logger: Logger;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
    private readonly queryBus: QueryBus,
    private readonly connectionService: ConnectionService,
  ) {
    this.logger = new Logger(AgentsController.name);
  }

  /**
   * Endpoint to create a new agent
   * @param dto CreateAgentDto
   * @returns CreateAgentResponse
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAgent(@Body() dto: CreateAgentDto): Promise<CreateAgentResponse> {
    this.logger.log('createAgent');
    return await this.commandBus.execute(new CreateAgentCommand(dto));
  }

  /**
   * Endpoint for agents to send a new message
   * @param dto CreateAgentMessageDto
   * @returns CreateMessageResponse
   */
  @Post('/messages')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @Body() dto: CreateAgentMessageDto,
  ): Promise<CreateMessageResponse> {
    this.logger.log('sendMessage');
    await this.commandBus.execute(
      new AssignAgentCommand(dto.agentId, dto.userId),
    );
    const message: CreateMessageResponse = await this.commandBus.execute(
      new CreateMessageCommand(
        {
          body: dto.body,
          type: dto.type,
          userId: dto.userId,
        },
        MessageSenders.AGENT,
      ),
    );
    this.eventBus.publish(
      new SendMessageToUserEvent({
        id: message.id,
        userId: message.userId,
        body: message.body,
        sender: message.sender,
        type: message.type,
        createdAt: message.createdAt,
      }),
    );
    this.eventBus.publish(new SendMessageToAgentsEvent(message, dto.agentId));
    return message;
  }

  /**
   * Endpoint to stream messages to the agent
   * @param dto GetMessagesDto
   * @param agentParam AgentParams
   * @returns GetMessageResponse
   */
  @Get('/:agentId/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Query() dto: GetMessagesDto,
    @Param() agentParam: AgentParams,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<GetMessageResponse> {
    req.on('close', () => {
      this.connectionService.removeAgentConnection(+agentParam.agentId);
      this.logger.log(`Agent ${agentParam.agentId} disconnected`);
    });
    res.setHeader('Content-Type', 'text/event-stream');
    this.connectionService.setAgentConnection(+agentParam.agentId, res);
    this.logger.log('getMessages');
    if (dto.messageId !== undefined) {
      return await this.queryBus.execute(
        new GetAgentMessagesQuery(dto, agentParam),
      );
    }
  }

  /**
   * Endpoint to close conversation with a user
   * @param dto CloseConversationDto
   */
  @Post('/close-conversation')
  @HttpCode(HttpStatus.OK)
  async closeConversation(@Body() dto: CloseConversationDto): Promise<void> {
    this.logger.log('closeConversation');
    return await this.commandBus.execute(new UnassignAgentCommand(dto));
  }
}
