import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from "bcrypt"
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, @InjectPinoLogger(UsersService.name) private readonly logger: PinoLogger) {}

    async createUser(data: CreateUserDto) {     
        this.logger.info({email : data.email}, "Creating user started"); 
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email : data.email
            }
        })

        if(existingUser) {
            this.logger.warn({email: data.email}, "User already exists")
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

        this.logger.info({
            userId: user.id, email: user.email
        }, "User created successfully")

        return {
            message: "User created successfully",
            user
        }
    }

    async createAdmin(data: CreateUserDto) {
        this.logger.info({email : data.email}, "Admin created successfully");
        const existingAdmin = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        })

        if(existingAdmin) {
            this.logger.warn({email: data.email}, "Admin already exists")
            throw new BadRequestException("Admin already exists");
        }

        const hashPassword = await bcrypt.hash(data.password,10);

        const admin = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashPassword,
                role: data.role
            }
        })

        this.logger.info({
            userId: admin.id, email: admin.email
        }, "Admin created successfully")

        return {
            message: "Admin created successfully",
            admin
        }
    }

    async getAllUsers() {
        this.logger.debug('Fetching all users')
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
        this.logger.info({count: users.length}, "Rooms fetched")
        return users;
    }

    async deleteUser(email: string) {
        this.logger.info({email}, "Delete user request received")
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!existingUser) {
            this.logger.warn({email}, "User not found for deletion")
            throw new NotFoundException("User not found");
        }

        await this.prisma.user.delete({
            where: {
                email
            }
        })

        this.logger.info({email},"User deleted successfully");
        
        return {
            message: "User deleted successfully"
        }
    }

    async updateUser(email: string, data: any) {
        this.logger.info({email}, "User updated successfully");
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!existingUser) {
            this.logger.warn("User not found for update");
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

        this.logger.info({email}, "User updated successfully")

        return {
            message: "User updated successfully",
            updatedUser
        }
    }

    async createRooms(data: any) {
        this.logger.info({roomName: data.name}, "Creating room")
        const room = await this.prisma.room.create({
            data: {
                name: data.name,
                status: data.status?? "AVAILABLE",
                capacity: data.capacity,
                Amenities: data.amenities
            }
        })

         this.logger.info({ roomId: room.id }, 'Room created');

        return {
            message: "Room created successfully",
            room
        }
    }

    async getRooms() {
        this.logger.debug("Fetching all rooms")
        const room = await this.prisma.room.findMany({
            select: {
                id: true,
                name: true,
                status: true,
                capacity: true,
                Amenities: true,
                maintenanceStart: true,
                maintenanceEnd: true
            }
        })
        this.logger.info({ count: room.length }, 'Rooms fetched');
        return room;
    }

    async deleteRooms(name: string) {
        this.logger.info({ name }, 'Delete room request');
        const existingRoom = await this.prisma.room.findUnique({
            where: {
                name
            }
        })

        if(!existingRoom) {
            this.logger.warn({ name }, 'Room not found');
            throw new NotFoundException("Room not found")
        }

        await this.prisma.room.delete({
            where: {
                name
            }
        })

         this.logger.info({ name }, 'Room deleted');

        return {
            message : "Room deleted successfully"
        }
    }

    async updateRooms(name: string, data: any) {
        this.logger.info({name}, "Room is updated successfully")
        const existingRoom = await this.prisma.room.findUnique({
            where: {
                name
            }
        })

        if(!existingRoom) {
            this.logger.warn({name}, "Room not found");
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
                Amenities: data.amenities,
                maintenanceStart: data.maintenanceStart ? new Date(data.maintenanceStart) : null,
                maintenanceEnd: data.maintenanceEnd ? new Date(data.maintenanceEnd):null
            }
        })

        if(data.status === "MAINTANENCE") {
            await this.prisma.booking.updateMany({
                where: {
                    roomId: existingRoom.id,
                    startTime: {
                        gte: new Date(data.maintenanceStart),
                        lte: new Date(data.maintenanceEnd)
                    }
                },
                data: {
                    status: "CANCELED"
                }
            })
            this.logger.info({name}, "Bookings cancelled due to maintenance")
        }

        this.logger.info({name}, "Room updated")

        return {
            message: "Room updated successfully",updateRoom
        }
    }
}

