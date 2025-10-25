import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegisterController } from './register/register.controller';
import { RegisterService } from './register/register.service';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { AuthService } from './auth/auth.service';
import { RateLimiterService } from './rate-limiter/rate-limiter.service';
import { RolesService } from './roles/roles.service';
import { RolesController } from './roles/roles.controller';
import { AuthPermissionGuard } from './middleware/login.guard';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { ShopifyService } from './shopify/shopify.service';
import { ApiKeysService } from './api/api.service';
import { ApiController } from './api/api.controller';
import { WebhookService } from './webhook/webhook.service';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    RegisterController,
    LoginController,
    UserController,
    RolesController,
    ProductsController,
    ApiController,
    WebhookController,
  ],
  providers: [
    AppService,
    RegisterService,
    LoginService,
    UserService,
    AuthService,
    RateLimiterService,
    RolesService,
    AuthPermissionGuard,
    ProductsService,
    ShopifyService,
    ApiKeysService,
    WebhookService,
  ],
})
export class AppModule {}
