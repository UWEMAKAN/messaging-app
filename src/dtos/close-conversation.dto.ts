import { IsBoolean, IsInt, Min } from 'class-validator';

export class CloseConversationDto {
  /**
   * valid agentId
   * @example 1
   */
  @IsInt()
  @Min(1)
  public readonly agentId: number;

  /**
   * valid userId
   * @example 1
   */
  @IsInt()
  @Min(1)
  public readonly userId: number;
}

export class CloseConversationResponse {
  /**
   * conversation deletion status
   * @example true
   */
  @IsBoolean()
  public readonly deleted: boolean;
}
