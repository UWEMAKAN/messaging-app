import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import {
  AssignAgentCommand,
  CreateAgentCommand,
  CreateMessageCommand,
  SendMessageToAgentsEvent,
  SendMessageToUserEvent,
} from '../../application';
import {
  CreateAgentDto,
  CreateAgentMessageDto,
  CreateAgentResponse,
  CreateMessageResponse,
} from '../../dtos';
import { MessageSenders } from '../../utils';

@Controller('agents')
export class AgentsController {
  private readonly logger: Logger;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
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
    this.eventBus.publish(new SendMessageToUserEvent(message));
    this.eventBus.publish(new SendMessageToAgentsEvent(message, dto.agentId));
    return message;
  }
}
