import {
  IsOptional,
  IsNumberString,
  IsDateString,
  IsIn,
  IsInt,
  IsString,
  Min,
} from 'class-validator';
import { DurationStrings, MessageSenders, MessageTypes } from '../utils';

export class GetMessagesDto {
  /**
   * Duration for which to fetch message
   * @example ONE_DAY
   */
  @IsIn(Object.values(DurationStrings))
  public readonly duration: string;
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
   * message sender type
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

  /**
   * First name of the user
   * @example Bender
   */
  @IsString()
  @IsOptional()
  firstName?: string;

  /**
   * Last name of the user
   * @example Rodriguez
   */
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class UserParams {
  /**
   * Id of the current user.
   * @example 1
   */
  @IsNumberString()
  public readonly userId: number;
}

export class AgentParams {
  /**
   * Id of the current agent.
   * @example 1
   */
  @IsNumberString()
  public readonly agentId: number;
}

export class TicketResponse {
  /**
   * valid agent id.
   * @example 1
   */
  @IsInt()
  @Min(1)
  agentId: number;

  /**
   * valid userId
   * @example 1
   */
  @IsInt()
  @Min(1)
  userId: number;
}
