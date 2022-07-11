import { IsArray, IsInt, IsString, Min } from 'class-validator';
import { GetMessageResponse } from './get-messages.dto';

export class UserDetailsResponse {
  /**
   * id of the user
   * @example 1
   */
  @IsInt()
  @Min(1)
  id: number;

  /**
   * first name of the user
   * @example Bender
   */
  @IsString()
  firstName: string;

  /**
   * last name of the user
   * @example Rodriguez
   */
  @IsString()
  lastName: string;

  /**
   * email of the user
   * @example bender@futurama.com
   */
  @IsString()
  email: string;

  @IsArray()
  messages: GetMessageResponse[];

  /**
   * user registration date
   * @example Bender
   */
  @IsString()
  createdAt: string;
}
