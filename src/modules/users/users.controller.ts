import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { User } from '../schemas/user.schema';
import { UserFacadeService } from './services/user.facade.service';

@Controller('users')
export class UsersController {
  constructor(private readonly facade: UserFacadeService) {}

  @Post()
  async create(@Body() user: User) {
    return this.facade.create(user);
  }

  @Get()
  async findAll() {
    return this.facade.findAll();
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    return this.facade.findOne(username);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() user: Partial<User>) {
    return this.facade.update(id, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.facade.delete(id);
  }
}
