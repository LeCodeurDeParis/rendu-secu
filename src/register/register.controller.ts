import { Controller, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { UserDTO } from 'src/DTO/userDTO';
import { RegisterService } from './register.service';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}
  @Post()
  create(@Body() body: UserDTO) {
    return this.registerService.create(body);
  }
}
