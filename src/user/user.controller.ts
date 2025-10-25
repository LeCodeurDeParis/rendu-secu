import {
  Controller,
  Get,
  Headers,
  UseGuards,
  Request,
  Put,
  Body,
  Post,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthPermissionGuard } from 'src/middleware/login.guard';
import { RequirePermissions } from 'src/middleware/permissions.decorator';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_users')
  async getAllUsers(@Request() req: any) {
    return await this.userService.getAllUsers(
      req.headers.authorization,
      req.headers['x-api-key'],
    );
  }

  @Get('my-user')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async getUserProfile(@Request() req: any) {
    return await this.userService.getUserProfile(
      req.headers.authorization,
      req.headers['x-api-key'],
    );
  }

  @Put('change-password')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async changePassword(
    @Request() req: any,
    @Body() body: { newPassword: string },
  ) {
    return await this.userService.changePassword(req.user, body.newPassword);
  }

  @Post('logout')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async logout(@Headers('authorization') authHeader: string) {
    return await this.userService.logout(authHeader);
  }
}
