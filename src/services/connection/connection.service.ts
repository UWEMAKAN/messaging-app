import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';

export const agentConnections = new Map<number, Response>();
export const userConnections = new Map<number, Response>();

@Injectable()
export class ConnectionService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(ConnectionService.name);
  }

  getAgentConnection(agentId: number): Response {
    return agentConnections.get(agentId);
  }

  getUserConnection(userId: number): Response {
    return userConnections.get(userId);
  }

  getAgentConnections(): [number, Response][] {
    return [...agentConnections.entries()];
  }

  getUserConnections(): [number, Response][] {
    return [...userConnections.entries()];
  }

  setAgentConnection(agentId: number, conn: Response) {
    agentConnections.set(agentId, conn);
  }

  setUserConnection(userId: number, conn: Response) {
    userConnections.set(userId, conn);
  }

  removeAgentConnection(agentId: number): boolean {
    return agentConnections.delete(agentId);
  }

  removeUserConnection(userId: number): boolean {
    return userConnections.delete(userId);
  }
}
