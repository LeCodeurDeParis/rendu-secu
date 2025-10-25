import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthPermissionGuard } from 'src/middleware/login.guard';
import { RequirePermissions } from 'src/middleware/permissions.decorator';
import { ApiKeysService } from './api.service';

@Controller('api-keys')
export class ApiController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async getMyApiKeys(@Request() req: any) {
    return await this.apiKeysService.getUserApiKeys(req.user.id);
  }

  @Post()
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async createApiKey(@Body() body: { name: string }, @Request() req: any) {
    return await this.apiKeysService.generateApiKey(req.user.id, body.name);
  }

  @Delete(':id/delete')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async deleteApiKey(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return await this.apiKeysService.deleteApiKey(req.user.id, id);
  }

  @Put(':id/reactivate')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async reactivateApiKey(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return await this.apiKeysService.reactivateApiKey(req.user.id, id);
  }

  @Put(':id/deactivate')
  @UseGuards(AuthPermissionGuard)
  @RequirePermissions('can_get_my_user')
  async deactivateApiKey(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return await this.apiKeysService.deactivateApiKey(req.user.id, id);
  }
}
