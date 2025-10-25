import { Injectable } from '@nestjs/common';
import { usersTable } from 'src/db/schema';
import { UserDTO } from 'src/DTO/userDTO';
import { db } from 'src/index';

@Injectable()
export class RegisterService {
  async create(body: UserDTO) {
    try {
      const result = await db
        .insert(usersTable)
        .values({
          ...body,
          roleId: 2,
        })
        .returning();
      return {
        message: 'User created successfully',
        data: result[0],
      };
    } catch (error) {
      throw new Error(error as string);
    }
  }
}
