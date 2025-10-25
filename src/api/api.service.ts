import { Injectable, UnauthorizedException } from '@nestjs/common';
import { db } from 'src/index';
import { apiKeysTable, usersTable } from 'src/db/schema';
import { and, eq } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  async generateApiKey(userId: number, name: string) {
    try {
      const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`;

      const result = await db
        .insert(apiKeysTable)
        .values({
          key: apiKey,
          name: name || 'Clé API',
          userId,
          isActive: true,
        })
        .returning();

      return {
        message: 'Clé API générée avec succès',
        data: {
          id: result[0].id,
          name: result[0].name,
          key: result[0].key,
          createdAt: result[0].createdAt,
        },
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la génération de la clé API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getUserApiKeys(userId: number) {
    const apiKeys = await db
      .select({
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        isActive: apiKeysTable.isActive,
        createdAt: apiKeysTable.createdAt,
        lastUsedAt: apiKeysTable.lastUsedAt,
      })
      .from(apiKeysTable)
      .where(eq(apiKeysTable.userId, userId));

    return {
      message: 'Clés API récupérées avec succès',
      data: apiKeys,
      count: apiKeys.length,
    };
  }

  async validateApiKey(apiKey: string) {
    const apiKeyRecord = await db
      .select({
        apiKey: apiKeysTable,
        user: usersTable,
      })
      .from(apiKeysTable)
      .leftJoin(usersTable, eq(apiKeysTable.userId, usersTable.id))
      .where(eq(apiKeysTable.key, apiKey))
      .limit(1);

    if (!apiKeyRecord.length || !apiKeyRecord[0].apiKey.isActive) {
      throw new UnauthorizedException('Clé API invalide ou inactive');
    }

    await db
      .update(apiKeysTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeysTable.id, apiKeyRecord[0].apiKey.id));

    return apiKeyRecord[0].user;
  }
  async reactivateApiKey(userId: number, apiKeyId: number) {
    const result = await db
      .update(apiKeysTable)
      .set({ isActive: true })
      .where(
        and(eq(apiKeysTable.id, apiKeyId), eq(apiKeysTable.userId, userId)),
      )
      .returning();

    if (!result.length) {
      throw new Error('Clé API introuvable');
    }

    return {
      message: 'Clé API réactivée avec succès',
      data: result[0],
    };
  }
  async deleteApiKey(userId: number, apiKeyId: number) {
    const result = await db
      .delete(apiKeysTable)
      .where(
        and(eq(apiKeysTable.id, apiKeyId), eq(apiKeysTable.userId, userId)),
      )
      .returning();

    if (!result.length) {
      throw new Error('Clé API introuvable');
    }

    return {
      message: 'Clé API supprimée avec succès',
    };
  }

  async deactivateApiKey(userId: number, apiKeyId: number) {
    const result = await db
      .update(apiKeysTable)
      .set({ isActive: false })
      .where(
        and(eq(apiKeysTable.id, apiKeyId), eq(apiKeysTable.userId, userId)),
      )
      .returning();

    if (!result.length) {
      throw new Error('Clé API introuvable');
    }

    return {
      message: 'Clé API désactivée avec succès',
    };
  }
}
