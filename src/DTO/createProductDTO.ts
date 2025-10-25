import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
export class CreateProductDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10000)
  price: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsNotEmpty()
  @IsString()
  shopify_id: string;

  @IsOptional()
  @IsNumber()
  sales_count?: number = 0;
}
