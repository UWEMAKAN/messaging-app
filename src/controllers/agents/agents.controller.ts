import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAgentCommand } from '../../application';
import {
  CreateAgentDto,
  CreateAgentMessageDto,
  CreateAgentResponse,
} from '../../dtos';

@Controller('agents')
export class AgentsController {
  private readonly logger: Logger;

  constructor(private readonly commandBus: CommandBus) {
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

  @Post('/messages')
  @HttpCode(HttpStatus.OK)
  async createMessage(@Body() dto: CreateAgentMessageDto) {
    //
  }
}
