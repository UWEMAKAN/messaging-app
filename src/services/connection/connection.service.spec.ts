import { Response } from 'express';
import { ConnectionService } from './connection.service';

describe(ConnectionService.name, () => {
  let service: ConnectionService;

  beforeEach(() => {
    service = new ConnectionService();
  });

  test(`${ConnectionService.name} should be defined`, () => {
    expect(service).toBeDefined();
  });

  test('should set, get and remove agent connection', () => {
    const conn = {} as Response;
    const agentId = 1;
    service.setAgentConnection(agentId, conn);
    expect.assertions(5);
    expect(service.getAgentConnection(agentId)).toStrictEqual(conn);
    expect(service.getAgentConnections()).toStrictEqual([[agentId, conn]]);
    expect(service.removeAgentConnection(agentId)).toBeTruthy();
    expect(service.getAgentConnection(agentId)).toBeUndefined();
    expect(service.getAgentConnections()).toStrictEqual([]);
  });

  test('should set, get and remove user connection', () => {
    const conn = {} as Response;
    const userId = 1;
    service.setUserConnection(userId, conn);
    expect.assertions(5);
    expect(service.getUserConnection(userId)).toStrictEqual(conn);
    expect(service.getUserConnections()).toStrictEqual([[userId, conn]]);
    expect(service.removeUserConnection(userId)).toBeTruthy();
    expect(service.getUserConnection(userId)).toBeUndefined();
    expect(service.getUserConnections()).toStrictEqual([]);
  });
});
