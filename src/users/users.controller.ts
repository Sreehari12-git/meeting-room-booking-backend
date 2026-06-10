import { Body, Controller, Delete, Get, Param, Post, Put, Res, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { error } from 'console';

@Controller("admin") @UseGuards(RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({summary: "Used to create new user"})
  @ApiResponse({status: 201, description: "User created successfully",schema: {example: {message: "User created successfully", user: {id: 1, name: "John Doe", email: "john@example.com", role: "USER"}}}})
  @ApiBearerAuth()
  @Post("create-user") @Roles(Role.ADMIN)
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @ApiOperation({summary: "Used to create admin"})
  @ApiResponse({status: 201, description: "Admin created successfully", schema: {example: {message: "Admin created successfully", user: {id: 1, name: "Admin", email: "admin@gmail.com", role: "ADMIN"}}}})
  @Post("create-admin")
  createAdmin(@Body() body: CreateUserDto) {
    return this.usersService.createAdmin(body);
  }

  @ApiResponse({status: 200, description: "Users fetched successfully", schema: {example: {message: "Users fetched successfully", users: [{id: 1, name: "John Doe", email: "john@example.com", role: "USER"}]}}})
  @Get("get-all")
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully' })
  @Get('get-all')
  getAllUser() {
    return this.usersService.getAllUsers();
  }

  @Delete("user/:email") @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user by email' })
  @ApiResponse({ status: 200, description: 'User deleted successfully', schema: {example: {message: "User deleted succesfully"}} })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  deleteUser(@Param("email") email: string) {
    return this.usersService.deleteUser(email);
  }

  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated successfully', schema: {example: {message: "User updated successfully", user: {id : 1, name: "John Doe", email: "john@example.com", role: "USER" }}} })
  @ApiResponse({ status: 404, description: 'User not found', schema: {example: {statusCode: 404, message: "User not found", error: "Not found"}} })
  @ApiBearerAuth()
  @Put("user/:email") @Roles(Role.ADMIN)
  updateUser(@Param("email") email: string,@Body() body: any) {
    return this.usersService.updateUser(
      email,
      body
    );
  }

  @ApiOperation({ summary: 'Create a meeting room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiBearerAuth()
  @Post("create-rooms") @Roles(Role.ADMIN)
  createRoom(@Body() body: any) {
    return this.usersService.createRooms(body);
  }

  @ApiOperation({ summary: 'Get all meeting rooms' })
  @ApiResponse({ status: 200, description: 'Rooms fetched successfully' })
  @Get("get-rooms") 
  getAllRooms() {
    return this.usersService.getRooms();
  }

  @ApiOperation({ summary: 'Delete room by name' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiBearerAuth()
  @Delete("room/:name") @Roles(Role.ADMIN)
  deleteRoom(@Param("name") name : string) {
    return this.usersService.deleteRooms(name);
  }

  @ApiOperation({ summary: 'Update room details' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiBearerAuth()
  @Put("room/:name") @Roles(Role.ADMIN)
  updateRoom(@Param("name") name: string,@Body() body: any) {
    return this.usersService.updateRooms(
      name,
      body
    );
  }
}

