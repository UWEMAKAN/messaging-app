import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppController } from '../../app.controller';
import { AgentLoginResponse, LoginDto, UserLoginResponse } from '../../dtos';
import { User, Agent } from '../../entities';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
  ) {
    this.logger = new Logger(AppController.name);
  }

  /**
   * User login endpoint
   * @param dto LoginDto
   * @returns UserLoginResponse
   */
  @Post('/login/users')
  @HttpCode(HttpStatus.OK)
  async userLogin(@Body() dto: LoginDto): Promise<UserLoginResponse> {
    let user: User = null;

    try {
      user = await this.userRepository.findOne({
        where: { email: dto.email },
        select: ['id'],
      });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    return { userId: +user.id };
  }

  /**
   * Agent login endpoint
   * @param dto LoginDto
   * @returns AgentLoginResponse
   */
  @Post('/login/agents')
  @HttpCode(HttpStatus.OK)
  async agentLogin(@Body() dto: LoginDto): Promise<AgentLoginResponse> {
    let agent: Agent = null;
    try {
      agent = await this.agentRepository.findOne({
        where: { email: dto.email },
        select: ['id'],
      });
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!agent) {
      throw new HttpException('Agent not found', HttpStatus.UNAUTHORIZED);
    }

    return { agentId: +agent.id };
  }
}
