import {
  IsOptional,
  IsNumberString,
  IsDateString,
  IsIn,
  IsInt,
  IsString,
  Min,
} from 'class-validator';
import { MessageTypes } from '../utils';

export class GetUserMessagesDto {
  /**
   * Id of the last message the user received.
   * if messageId >= 0 messages with id after messageId will be streamed to the user
   * else the user will simply be subscribed to the event stream;
   * @example 1
   */
  @IsOptional()
  @IsNumberString()
  public readonly messageId: number;
}

export class GetMessageResponse {
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

export class UserParams {
  /**
   * Id of the current user.
   * @example 1
   */
  @IsNumberString()
  public readonly userId: number;
}
