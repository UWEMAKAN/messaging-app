import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public readonly email: string;

  @IsString()
  @MinLength(6)
  public readonly password: string;

  @IsString()
  @MinLength(2)
  public readonly firstName: string;

  @IsString()
  @MinLength(2)
  public readonly lastName: string;
}
