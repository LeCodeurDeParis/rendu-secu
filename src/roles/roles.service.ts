import { Injectable } from '@nestjs/common';
import { db } from 'src/index';
import { rolesTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { RoleDTO } from 'src/DTO/roleDTO';

@Injectable()
export class RolesService {
  async getAllRoles(): Promise<{
    message: string;
    data: RoleDTO[];
    count: number;
  }> {
    const roles: RoleDTO[] = (await db.select().from(rolesTable)) as RoleDTO[];
    return {
      message: 'Liste des rôles récupérée avec succès',
      data: roles,
      count: roles.length,
    };
  }

  async getRoleById(id: number) {
    const role = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.id, id))
      .limit(1);

    if (!role.length) {
      throw new Error('Rôle introuvable');
    }

    return role[0];
  }

  async createRole(roleData: {
    name: string;
    can_post_login: boolean;
    can_get_my_user: boolean;
    can_get_users: boolean;
  }) {
    const newRole = await db.insert(rolesTable).values(roleData).returning();

    return {
      message: 'Rôle créé avec succès',
      data: newRole[0],
    };
  }
}
