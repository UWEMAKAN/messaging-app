import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import {
  AssignAgentCommand,
  CreateAgentCommand,
  CreateMessageCommand,
  GetAgentMessagesQuery,
  SendMessageToAgentsEvent,
  SendMessageToUserEvent,
  UnassignAgentCommand,
  UnassignAllCommand,
} from '../../application';
import {
  AddStockMessagesDto,
  AgentParams,
  CloseConversationDto,
  CreateAgentDto,
  CreateAgentMessageDto,
  CreateAgentResponse,
  CreateMessageResponse,
  GetMessageResponse,
  GetMessagesDto,
  StockMessageDto,
  TicketResponse,
} from '../../dtos';
import { AgentsUsers, StockMessage } from '../../entities';
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
    @InjectRepository(AgentsUsers)
    private readonly agentsUsersRepository: Repository<AgentsUsers>,
    @InjectRepository(StockMessage)
    private readonly stockMessageRepository: Repository<StockMessage>,
  ) {
    this.logger = new Logger(AgentsController.name);
  }

  /**
   * Endpoint to create a new agent
   * @param dto CreateAgentDto
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
   * Endpoint to fetch messages by the agent
   * @param dto GetMessagesDto
   */
  @Get('/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Query() dto: GetMessagesDto,
  ): Promise<GetMessageResponse[]> {
    this.logger.log('getMessages');
    return await this.queryBus.execute(new GetAgentMessagesQuery(dto));
  }

  /**
   * Endpoint for agents to subscribe to new messages
   * @param agentParam AgentParams
   */
  @Get('/:agentId/subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(
    @Param() agentParam: AgentParams,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.logger.log('subscribe agent');
    const agentId = +agentParam.agentId;
    req.on('close', () => {
      this.connectionService.removeAgentConnection(agentId);
      this.logger.log(`Agent ${agentId} disconnected`);
      setTimeout(async () => {
        const conn = this.connectionService.getAgentConnection(agentId);
        if (!conn) {
          await this.commandBus.execute(new UnassignAllCommand(agentId));
        }
      }, 10000);
    });
    res.setHeader('Content-Type', 'text/event-stream');
    this.connectionService.setAgentConnection(agentId, res);
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

  /**
   * Endpoint to fetch all tickets
   */
  @Get('/tickets')
  @HttpCode(HttpStatus.OK)
  async getTickets(): Promise<TicketResponse[]> {
    try {
      return await this.agentsUsersRepository.find({
        select: ['agentId', 'userId'],
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Endpoint to add stock messages
   * @param dto AddStockMessagesDto
   */
  @Post('/messages/stock')
  @HttpCode(HttpStatus.OK)
  async addStockMessages(
    @Body() dto: AddStockMessagesDto,
  ): Promise<StockMessageDto[]> {
    return await this.stockMessageRepository.save(dto.messages);
  }

  @Get('/messages/stock')
  @HttpCode(HttpStatus.OK)
  async getStockMessages(): Promise<StockMessageDto[]> {
    return await this.stockMessageRepository.find();
  }
}
