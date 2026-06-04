import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from "bcrypt"

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async createUser(data: CreateUserDto) {
        console.log("Data for creating users",data);
        
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email : data.email
            }
        })

        if(existingUser) {
            throw new BadRequestException("User already exists");
        }

        const hashPassword = await bcrypt.hash(data.password,10);

        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashPassword,
                role: data.role
            }
        });

        return {
            message: "User created successfully",
            user
        }
    }

    async getAllUsers() {
        const users = await this.prisma.user.findMany( {
            where: {
                role: "EMPLOYEE"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        return users;
    }

    async deleteUser(email: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!existingUser) {
            throw new NotFoundException("User not found");
        }

        await this.prisma.user.delete({
            where: {
                email
            }
        })
        return {
            message: "User deleted successfully"
        }
    }

    async updateUser(email: string, data: any) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!existingUser) {
            throw new NotFoundException("User not found");
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                email
            },
            data: {
                name: data.name,
                role: data.role,
                email: data.email
            }

        })

        return {
            message: "User updated successfully",
            updatedUser
        }
    }

    async createRooms(data: any) {
        const room = await this.prisma.room.create({
            data: {
                name: data.name,
                status: data.status?? "AVAILABLE",
                capacity: data.capacity,
                Amenities: data.amenities
            }
        })

        return {
            message: "Room created successfully",
            room
        }
    }

    async getRooms() {
        const room = await this.prisma.room.findMany({
            select: {
                id: true,
                name: true,
                status: true,
                capacity: true,
                Amenities: true
            }
        })
        return room;
    }

    async deleteRooms(name: string) {
        const existingRoom = await this.prisma.room.findUnique({
            where: {
                name
            }
        })

        if(!existingRoom) {
            throw new NotFoundException("Room not found")
        }

        await this.prisma.room.delete({
            where: {
                name
            }
        })

        return {
            message : "Room deleted successfully"
        }
    }

    async updateRooms(name: string, data: any) {
        const existingRoom = await this.prisma.room.findUnique({
            where: {
                name
            }
        })

        if(!existingRoom) {
            throw new NotFoundException("Room not found")
        }

        const updateRoom = await this.prisma.room.update({
            where: {
                name
            },
            data: {
                name: data.name,
                status: data.status,
                capacity: data.capacity,
                Amenities: data.amenities
            }
        })

        return {
            message: "Room updated successfully",updateRoom
        }
    }
}

