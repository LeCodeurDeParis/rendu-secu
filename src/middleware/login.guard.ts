import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth/auth.service';
import { db } from 'src/index';
import { usersTable, rolesTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { ApiKeysService } from 'src/api/api.service';

export const RequirePermissions = (...permissions: string[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('permissions', permissions, descriptor.value);
  };
};

@Injectable()
export class AuthPermissionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
    private apiService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const apiKey = request.headers['x-api-key'];

    if (apiKey) {
      try {
        const user = await this.apiService.validateApiKey(apiKey);
        if (!user) {
          throw new UnauthorizedException('Clé API invalide');
        }
        request.user = user;

        const userWithRole = await db
          .select({
            user: usersTable,
            role: rolesTable,
          })
          .from(usersTable)
          .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
          .where(eq(usersTable.id, user.id))
          .limit(1);

        if (userWithRole.length) {
          request.role = userWithRole[0].role;
        }

        return true;
      } catch (error) {
        throw new UnauthorizedException(
          `Clé API invalide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    if (!authHeader || typeof authHeader !== 'string') {
      const body = request.body;
      if (body?.email && body?.password) {
        return await this.checkLoginPermission(body.email, body.password);
      }
      throw new UnauthorizedException('Token manquant ou invalide');
    }

    const token = this.authService.extractTokenFromHeader(authHeader);
    if (!token) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }

    try {
      const decoded = this.authService.verifyToken(token);

      const userWithRole = await db
        .select({
          user: usersTable,
          role: rolesTable,
        })
        .from(usersTable)
        .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
        .where(eq(usersTable.email, decoded.email))
        .limit(1);

      if (!userWithRole.length) {
        throw new UnauthorizedException('Utilisateur introuvable');
      }

      const user = userWithRole[0].user;
      const role = userWithRole[0].role;

      const tokenCreatedAt = new Date((decoded as any).iat * 1000);
      const passwordUpdatedAt = new Date(user.passwordUpdatedAt);

      const tokenCreatedAtUTC = new Date(
        tokenCreatedAt.getTime() - tokenCreatedAt.getTimezoneOffset() * 60000,
      );

      if (passwordUpdatedAt.getTime() > tokenCreatedAtUTC.getTime()) {
        throw new UnauthorizedException(
          'Token expiré - mot de passe modifié. Veuillez vous reconnecter.',
        );
      }

      request.user = user;
      request.role = role;

      const requiredPermissions = this.reflector.get<string[]>(
        'permissions',
        context.getHandler(),
      );

      if (requiredPermissions && requiredPermissions.length > 0) {
        for (const permission of requiredPermissions) {
          if (!this.hasPermission(role, permission)) {
            throw new UnauthorizedException(
              `Permission refusée: ${permission}`,
            );
          }
        }
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Token invalide: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private hasPermission(role: any, permission: string): boolean {
    if (!role) return false;

    switch (permission) {
      case 'can_post_login':
        return role.can_post_login || false;
      case 'can_get_my_user':
        return role.can_get_my_user || false;
      case 'can_get_users':
        return role.can_get_users || false;
      case 'can_post_products':
        return role.can_post_products || false;
      case 'can_post_product_with_image':
        return role.can_post_product_with_image || false;
      case 'can_get_bestsellers':
        return role.can_get_bestsellers || false;
      default:
        return false;
    }
  }
  private async checkLoginPermission(
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const userWithRole = await db
        .select({
          user: usersTable,
          role: rolesTable,
        })
        .from(usersTable)
        .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
        .where(eq(usersTable.email, email))
        .limit(1);

      if (!userWithRole.length) {
        return false;
      }

      const user = userWithRole[0].user;
      const role = userWithRole[0].role;

      // Vérifier le mot de passe avec bcrypt
      const isPasswordValid = await this.authService.verifyPassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        return false;
      }

      return role?.can_post_login || false;
    } catch (error) {
      return false;
    }
  }
}
