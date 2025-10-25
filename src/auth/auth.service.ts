import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserDTO } from 'src/DTO/userDTO';

@Injectable()
export class AuthService {
  generateToken(
    payload: UserDTO & { id: number; passwordUpdatedAt: Date },
  ): string {
    const tokenPayload = {
      ...payload,
      passwordUpdatedAt: payload.passwordUpdatedAt || new Date(),
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
}
