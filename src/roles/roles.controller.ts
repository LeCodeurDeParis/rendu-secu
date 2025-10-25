import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAllRoles() {
    return await this.rolesService.getAllRoles();
  }

  @Get(':id')
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.getRoleById(id);
  }

  @Post()
  async createRole(
    @Body()
    roleData: {
      name: string;
      can_post_login: boolean;
      can_get_my_user: boolean;
      can_get_users: boolean;
    },
  ) {
    return await this.rolesService.createRole(roleData);
  }
}
