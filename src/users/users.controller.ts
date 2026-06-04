import { Body, Controller, Delete, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller("admin") @UseGuards(RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("create-user") @Roles(Role.ADMIN)
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @Get("get-all")
  getAllUser() {
    return this.usersService.getAllUsers();
  }

  @Delete("user/:email") @Roles(Role.ADMIN)
  deleteUser(@Param("email") email: string) {
    return this.usersService.deleteUser(email);
  }

  @Put("user/:email") @Roles(Role.ADMIN)
  updateUser(@Param("email") email: string,@Body() body: any) {
    return this.usersService.updateUser(
      email,
      body
    );
  }

  @Post("create-rooms") @Roles(Role.ADMIN)
  createRoom(@Body() body: any) {
    return this.usersService.createRooms(body);
  }

  @Get("get-rooms") 
  getAllRooms() {
    return this.usersService.getRooms();
  }

  @Delete("room/:name") @Roles(Role.ADMIN)
  deleteRoom(@Param("name") name : string) {
    return this.usersService.deleteRooms(name);
  }

  @Put("room/:name") @Roles(Role.ADMIN)
  updateRoom(@Param("name") name: string,@Body() body: any) {
    return this.usersService.updateRooms(
      name,
      body
    );
  }
}

