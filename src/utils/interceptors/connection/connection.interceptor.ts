import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { ConnectionService } from '../../../services';

@Injectable()
export class ConnectionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ConnectionInterceptor.name);

  constructor(private readonly connectionService: ConnectionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request: Request = http.getRequest();
    const response: Response = http.getResponse();
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');
    const { userId, agentId } = request.params;
    if (agentId) {
      this.connectionService.setAgentConnection(+agentId, response);
      request.on('close', () => {
        this.logger.log(`Agent ${agentId} closed their connection`);
        this.connectionService.removeAgentConnection(+agentId);
      });
    }
    if (userId) {
      this.connectionService.setUserConnection(+userId, response);
      request.on('close', () => {
        this.logger.log(`User ${userId} closed their connection`);
        this.connectionService.removeUserConnection(+userId);
      });
    }
    return next.handle();
  }
}
