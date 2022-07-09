import { IsEmail, IsInt, IsString, Min, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * valid email address
   * @example 'bender@futurama.com'
   */
  @IsEmail()
  public readonly email: string;

  /**
   * password, must be at least 6 characters
   *  @example 'Omicron'
   */
  @IsString()
  @MinLength(6)
  public readonly password: string;
}

export class UserLoginResponse {
  /**
   * id of the logged in user
   * @example 1
   */
  @IsInt()
  @Min(1)
  userId: number;
}

export class AgentLoginResponse {
  /**
   * id of the logged in agent
   * @example 1
   */
  @IsInt()
  @Min(1)
  agentId: number;
}
