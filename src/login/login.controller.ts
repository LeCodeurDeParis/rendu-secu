import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDTO } from 'src/DTO/loginDTO';
import { AuthPermissionGuard } from 'src/middleware/login.guard';
import { RequirePermissions } from 'src/middleware/permissions.decorator';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_post_login')
  async login(@Body() body: LoginDTO) {
    return await this.loginService.login(body);
  }
}
