import { Injectable, UnauthorizedException } from '@nestjs/common';
import { db } from 'src';
import { AuthService } from 'src/auth/auth.service';
import { rolesTable, usersTable } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { ApiKeysService } from 'src/api/api.service';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly apiService: ApiKeysService,
  ) {}

  async authenticateUser(
    authHeader?: string,
    apiKey?: string,
  ): Promise<{
    id: number;
    email: string;
    name: string;
  }> {
    // Vérifier d'abord la clé API si elle est fournie
    if (apiKey && typeof apiKey === 'string' && apiKey.startsWith('sk_')) {
      try {
        const user = await this.apiService.validateApiKey(apiKey);
        if (!user) {
          throw new UnauthorizedException('Clé API invalide');
        }
        return user;
      } catch (error) {
        throw new UnauthorizedException('Clé API invalide');
      }
    }

    // Sinon, vérifier le token JWT
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Token ou clé API manquante');
    }

    const token = this.authService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const decoded = this.authService.verifyToken(token);
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, decoded.email))
        .limit(1);

      if (!user.length) {
        throw new UnauthorizedException('Utilisateur introuvable');
      }

      return user[0];
    } catch (error) {
      console.error('Erreur dans authenticateUser:', error);
      throw new UnauthorizedException(
        `Erreur d'authentification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  async getUserProfile(authHeader?: string, apiKey?: string) {
    const user = await this.authenticateUser(authHeader, apiKey);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async getAllUsers(authHeader?: string, apiKey?: string) {
    await this.authenticateUser(authHeader, apiKey);
    const users = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
      })
      .from(usersTable);
    return {
      message: 'Liste des utilisateurs récupérée avec succès',
      data: users,
      count: users.length,
    };
  }

  async changePassword(
    authHeader?: string,
    apiKey?: string,
    newPassword?: string,
  ) {
    const user = await this.authenticateUser(authHeader, apiKey);

    // Hacher le nouveau mot de passe
    const hashedPassword = await this.authService.hashPassword(newPassword!);

    await db
      .update(usersTable)
      .set({
        password: hashedPassword, // Utiliser le mot de passe haché
        passwordUpdatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    return {
      message: 'Mot de passe modifié avec succès.',
      requireNewLogin: true,
    };
  }

  async checkPermission(
    authHeader?: string,
    apiKey?: string,
    permission?: string,
  ): Promise<boolean> {
    const user = await this.authenticateUser(authHeader, apiKey);
    const userWithRole = await db
      .select({
        user: usersTable,
        role: rolesTable,
      })
      .from(usersTable)
      .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
      .where(eq(usersTable.id, user.id))
      .limit(1);

    if (!userWithRole.length) {
      return false;
    }

    const role = userWithRole[0].role;

    switch (permission) {
      case 'can_post_login':
        return role?.can_post_login || false;
      case 'can_get_my_user':
        return role?.can_get_my_user || false;
      case 'can_get_users':
        return role?.can_get_users || false;
      case 'can_post_products':
        return role?.can_post_products || false;
      default:
        return false;
    }
  }

  async logout(authHeader?: string, apiKey?: string) {
    try {
      const user = await this.authenticateUser(authHeader, apiKey);

      await db
        .update(usersTable)
        .set({
          passwordUpdatedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id));

      return {
        message:
          'Déconnexion réussie. Tous vos tokens sont maintenant invalides.',
      };
    } catch (error) {
      console.error('Erreur dans logout:', error);
      throw new UnauthorizedException(
        `Erreur lors de la déconnexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }
}
