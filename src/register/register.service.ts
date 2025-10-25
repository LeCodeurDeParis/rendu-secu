import { Injectable, BadRequestException } from '@nestjs/common';
import { rolesTable, usersTable } from 'src/db/schema';
import { UserDTO } from 'src/DTO/userDTO';
import { db } from 'src/index';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RegisterService {
  constructor(private readonly authService: AuthService) {}

  async create(body: UserDTO) {
    try {
      if (!body || !body.password || !body.email || !body.name) {
        throw new BadRequestException(
          'Données utilisateur manquantes ou invalides',
        );
      }
      const existingRoles = await db.select().from(rolesTable);
      if (existingRoles.length === 0) {
        await db.insert(rolesTable).values({
          name: 'ADMIN',
          can_post_login: true,
          can_get_my_user: true,
          can_get_users: true,
          can_post_products: true,
          can_post_product_with_image: true,
          can_get_bestsellers: true,
        });
      }

      const hashedPassword = await this.authService.hashPassword(body.password);
      const result = await db
        .insert(usersTable)
        .values({
          name: body.name,
          email: body.email,
          password: hashedPassword,
          roleId: 2,
        })
        .returning();

      return {
        message: 'Utilisateur créé avec succès',
        data: {
          name: result[0].name,
          email: result[0].email,
          roleId: result[0].roleId,
          passwordUpdatedAt: result[0].passwordUpdatedAt,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Erreur lors de la création de l'utilisateur: ${error.message}`,
      );
    }
  }
}
