import { IsInt, Min } from 'class-validator';

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
