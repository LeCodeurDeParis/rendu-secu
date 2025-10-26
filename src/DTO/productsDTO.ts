import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class ProductDTO {
  @IsNotEmpty()
  @IsString()
  shopify_id: string;

  @IsNotEmpty()
  @IsNumber()
  created_by: number;

  @IsOptional()
  @IsNumber()
  sales_count?: number;
}
