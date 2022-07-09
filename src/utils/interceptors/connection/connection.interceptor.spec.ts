import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConnectionService } from '../../../services';
import { ConnectionInterceptor } from './connection.interceptor';

describe(ConnectionInterceptor.name, () => {
  const connectionService = {
    setUserConnection: jest.fn(),
    setAgentConnection: jest.fn(),
    removeUserConnection: jest.fn(),
    removeAgentConnection: jest.fn(),
  } as unknown as ConnectionService;
  const request = {
    on: jest.fn(),
    params: {
      userId: '1',
      agentId: '1',
    },
  } as unknown as Request;

  const response = {
    setHeader: jest.fn(),
  } as unknown as Response;

  const http = {
    getRequest: jest.fn().mockReturnValue(request),
    getResponse: jest.fn().mockReturnValue(response),
  };

  const context = {
    switchToHttp: jest.fn().mockReturnValue(http),
  } as unknown as ExecutionContext;

  const next = {
    handle: jest.fn(),
  } as CallHandler;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`${ConnectionInterceptor.name} should be defined`, () => {
    expect(new ConnectionInterceptor(connectionService)).toBeDefined();
  });

  test('should setHeaders, register on close listener and set connections', () => {
    const interceptor = new ConnectionInterceptor(connectionService);
    interceptor.intercept(context, next);
    expect.assertions(15);
    expect(context.switchToHttp).toBeCalledTimes(1);
    expect(http.getRequest).toBeCalledTimes(1);
    expect(http.getResponse).toBeCalledTimes(1);
    expect(response.setHeader).toBeCalledTimes(3);
    expect(response.setHeader).toHaveBeenNthCalledWith(
      1,
      'Content-Type',
      'text/event-stream',
    );
    expect(response.setHeader).toHaveBeenNthCalledWith(
      2,
      'Connection',
      'keep-alive',
    );
    expect(response.setHeader).toHaveBeenLastCalledWith(
      'Cache-Control',
      'no-cache',
    );
    expect(request.on).toHaveBeenCalledTimes(2);
    expect(connectionService.setUserConnection).toBeCalledTimes(1);
    expect(connectionService.setUserConnection).toBeCalledWith(1, response);
    expect(connectionService.removeUserConnection).not.toBeCalled();
    expect(connectionService.setAgentConnection).toBeCalledTimes(1);
    expect(connectionService.setAgentConnection).toBeCalledWith(1, response);
    expect(connectionService.removeAgentConnection).not.toBeCalled();
    expect(next.handle).toBeCalledTimes(1);
  });
});
