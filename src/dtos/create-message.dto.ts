import {
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  IsIn,
  IsDateString,
} from 'class-validator';
import { MessageSenders, MessageTypes } from '../utils';

export class CreateMessageDto {
  /**
   * valid userId
   * @example 1
   */
  @IsInt()
  @Min(1)
  userId: number;

  /**
   * message body
   * @example I want to make enquiries about your loan products
   */
  @IsString()
  @IsNotEmpty()
  body: string;

  /**
   * valid message type
   * @example TEXT
   */
  @IsIn(Object.values(MessageTypes))
  type: string;
}

export class CreateAgentMessageDto {
  /**
   * valid userId
   * @example 1
   */
  @IsInt()
  @Min(1)
  userId: number;

  /**
   * valid agentId
   * @example 1
   */
  @IsInt()
  @Min(1)
  agentId: number;

  /**
   * message body
   * @example I want to make enquiries about your loan products
   */
  @IsString()
  @IsNotEmpty()
  body: string;

  /**
   * valid message type
   * @example TEXT
   */
  @IsIn(Object.values(MessageTypes))
  type: string;
}

export class CreateMessageResponse {
  /**
   * id of the new message
   * @example 1
   */
  @IsInt()
  @Min(1)
  id: number;

  /**
   * message body
   * @example 'I want to make enquiries about your loan products'
   */
  @IsString()
  body: string;

  /**
   * valid userId
   * @example 1
   */
  @IsInt()
  @Min(1)
  userId: number;

  /**
   * valid message type
   * @example TEXT
   */
  @IsIn(Object.values(MessageTypes))
  type: string;

  /**
   * valid message type
   * @example USER
   */
  @IsIn(Object.values(MessageSenders))
  sender: string;

  /**
   * creation timestamp of message
   * @example '2022-07-09T10:20:34.414Z'
   */
  @IsDateString()
  createdAt: string;

  /**
   * Priority of the message.
   * The small the value, the higher the priority.
   * @example 1
   */
  @IsInt()
  @Min(1)
  priority?: number;
}
