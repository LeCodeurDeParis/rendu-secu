import { Injectable, BadRequestException } from '@nestjs/common';
import { LoginDTO } from 'src/DTO/loginDTO';
import * as jwt from 'jsonwebtoken';
import { usersTable } from 'src/db/schema';
import { UserDTO } from 'src/DTO/userDTO';
import { db } from 'src/index';
import { eq } from 'drizzle-orm';
import { RateLimiterService } from 'src/rate-limiter/rate-limiter.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class LoginService {
  constructor(
    private readonly rateLimiterService: RateLimiterService,
    private readonly authService: AuthService,
  ) {}
  async login(body: LoginDTO): Promise<{ message: string; data: string }> {
    try {
      if (!this.rateLimiterService.canAttempt(body.email)) {
        const timeRemaining = this.rateLimiterService.getTimeUntilNextAttempt(
          body.email as string,
        );
        throw new BadRequestException(
          `Trop de tentatives. Réessayez dans ${Math.ceil((timeRemaining ?? 0) / 1000)} secondes.`,
        );
      }
      const user: UserDTO[] = (await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, body.email))
        .limit(1)) as UserDTO[];

      if (!user.length) {
        throw new Error('Utilisateur introuvable');
      }
      const token: string = (await jwt.sign(
        body,
        process.env.JWT_SECRET || 'default-secret',
        {
          expiresIn: '1h',
        },
      )) as string;
      return { message: 'Login successful', data: token };
    } catch (error) {
      throw new Error(error as string);
    }
  }
}
