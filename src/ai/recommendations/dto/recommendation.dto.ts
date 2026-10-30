import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// There is intentionally NO userId here. The user's identity comes from the JWT.
// With ValidationPipe({ whitelist: true }) a userId sent in the body is ignored;
// with forbidNonWhitelisted: true it is rejected.
export class RecommendationDto {
  // How many products to recommend (default 5 in the service).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxRecommendations?: number;
}
