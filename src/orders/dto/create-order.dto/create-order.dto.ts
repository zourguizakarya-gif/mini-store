import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateOrderDto {

  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}