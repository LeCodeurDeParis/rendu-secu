import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
export class RoleDTO {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  can_post_login: boolean;

  @IsNotEmpty()
  @IsBoolean()
  can_get_my_user: boolean;

  @IsNotEmpty()
  @IsBoolean()
  can_get_users: boolean;

  @IsNotEmpty()
  @IsBoolean()
  can_post_products: boolean;

  @IsNotEmpty()
  @IsBoolean()
  can_post_product_with_image: boolean;

  @IsNotEmpty()
  @IsBoolean()
  can_get_bestsellers: boolean;
}
