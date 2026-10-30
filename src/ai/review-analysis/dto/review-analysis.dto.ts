import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ReviewAnalysisDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  // How many of the latest reviews to analyze (default 50).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  maxReviews?: number;
}
