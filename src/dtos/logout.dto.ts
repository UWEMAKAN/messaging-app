import { IsNumber, Min } from 'class-validator';

export class LogoutDto {
  /**
   * current agent id
   * @example 1
   */
  @IsNumber()
  @Min(1)
  public readonly agentId: number;
}
