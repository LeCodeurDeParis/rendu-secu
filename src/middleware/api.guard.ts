import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from 'src/api/api.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey =
      request.headers['x-api-key'] ||
      request.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      throw new UnauthorizedException(
        `Clé API manquante: ${apiKey instanceof Error ? apiKey.message : 'Unknown error'}`,
      );
    }

    try {
      const user = await this.apiKeysService.validateApiKey(apiKey);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Clé API invalide: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
