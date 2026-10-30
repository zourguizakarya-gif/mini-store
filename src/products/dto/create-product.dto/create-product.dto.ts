import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  category: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}