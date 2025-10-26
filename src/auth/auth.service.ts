import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserDTO } from 'src/DTO/userDTO';
import { getUtcDate, getUtcDateObject } from 'src/utils/date.utils';

@Injectable()
export class AuthService {
  generateToken(
    payload: UserDTO & { id: number; passwordUpdatedAt: Date },
  ): string {
    const tokenPayload = {
      ...payload,
      passwordUpdatedAt: payload.passwordUpdatedAt || getUtcDateObject(),
    };
    return jwt.sign(tokenPayload, process.env.JWT_SECRET || 'default-secret', {
      expiresIn: '1h',
    }) as string;
  }

  verifyToken(token: string): UserDTO {
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret',
      ) as UserDTO;
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      throw new Error(
        `Token invalide: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Hache un mot de passe avec bcrypt
   * @param password Mot de passe en clair
   * @returns Mot de passe haché
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Vérifie un mot de passe contre son hash
   * @param password Mot de passe en clair
   * @param hashedPassword Mot de passe haché
   * @returns true si le mot de passe correspond
   */
  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
