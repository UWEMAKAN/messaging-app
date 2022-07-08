import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
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

  /**
   * firstName, must be at least 2 characters
   *  @example 'Bender'
   */
  @IsString()
  @MinLength(2)
  public readonly firstName: string;

  /**
   * lastName, must be at least 2 characters
   *  @example 'Rodriguez'
   */
  @IsString()
  @MinLength(2)
  public readonly lastName: string;
}

export class CreateUserResponse {
  /**
   * id of the newly created user
   * @example { userId: 1 }
   */
  userId: number;
}
