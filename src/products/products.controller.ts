import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDTO } from 'src/DTO/createProductDTO';
import { AuthPermissionGuard } from 'src/middleware/login.guard';
import { RequirePermissions } from 'src/middleware/permissions.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('test-product')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_post_products')
  async createTestProduct(
    @Body() body: { shopify_id: string },
    @Request() req: any,
  ) {
    return await this.productsService.createTestProduct(
      body.shopify_id,
      req.user.id,
    );
  }

  @Post()
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_post_products')
  async createProduct(@Body() body: CreateProductDTO, @Request() req: any) {
    const hasImagePermission = req.role?.can_post_product_with_image || false;
    return await this.productsService.createProduct(
      body,
      req.user.id,
      hasImagePermission,
    );
  }

  @Get()
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_users')
  async getAllProducts() {
    return await this.productsService.getAllProducts();
  }

  @Get('my-products')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async getMyProducts(@Request() req: any) {
    return await this.productsService.getProductsByUser(req.user.id);
  }

  @Get('my-bestsellers')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_bestsellers')
  async getBestsellers(@Request() req: any) {
    return await this.productsService.getBestsellers(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.getProductById(id);
  }

  @Put(':id/sales')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async updateSalesCount(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { sales_count: number },
    @Request() req: any,
  ) {
    return await this.productsService.updateSalesCount(id, body.sales_count);
  }
}
