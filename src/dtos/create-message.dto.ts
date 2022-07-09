import {
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  IsIn,
  IsDateString,
} from 'class-validator';
import { MessagePriorities, MessageTypes } from '../utils';

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
   * @example I want to make enquiries about your loan products
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
  @IsString()
  type: string;

  /**
   * creation timestamp of message
   * @example ''
   */
  @IsDateString()
  createdAt: string;

  /**
   * priority of message
   * @example 1
   */
  @IsIn(Object.values(MessagePriorities))
  priority?: number;
}
