import { IsOptional, IsNumberString } from 'class-validator';

export class GetUserMessagesDto {
  @IsOptional()
  @IsNumberString()
  public readonly messageId: number;
}

export class UserParams {
  @IsNumberString()
  public readonly userId: number;
}
