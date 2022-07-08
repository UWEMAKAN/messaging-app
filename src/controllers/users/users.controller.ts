import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application';
import { CreateUserDto, CreateUserResponse } from '../../dtos';

@Controller('users')
export class UsersController {
  private readonly logger: Logger;

  constructor(private readonly commandBus: CommandBus) {
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
}
