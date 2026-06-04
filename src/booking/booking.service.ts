import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { checkAvailabilityDto } from './dto/check-availability.dto';
import { BookRoomDto } from './dto/book-room.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {
    constructor(private prisma: PrismaService) {};
    async checkAvailability(dto: checkAvailabilityDto) {
        const {startTime, endTime} = dto;

        const overlappingBookings = await this.prisma.booking.findMany( {
            where: {
                AND: [
                    {
                        startTime: {
                            lt: new Date(endTime)
                        },
                    },
                    {
                        endTime: {
                            gt: new Date(startTime)
                        }
                    }
                ]
            },
            select: {
                roomId: true
            }
        })

        const bookedRoomIds = overlappingBookings.map(booking => booking.roomId);
        const availableRooms = await this.prisma.room.findMany({
            where: {
                id: {
                    notIn: bookedRoomIds
                },
                status: "AVAILABLE"
            }   
        })
        return availableRooms;
    }

    async bookRoom(dto: BookRoomDto, userId: number) {
        const room = await this.prisma.room.findUnique({
            where: {
                id: dto.roomId
            }
        })

        if(!room) {
            throw new NotFoundException("Room not found");
        }

        if (new Date(dto.startTime) >= new Date(dto.endTime)) {
            throw new BadRequestException("End time must be greater than start time");
        }

        const existingBooking = await this.prisma.booking.findFirst({
            where: {
                roomId: dto.roomId,
                status: "UPCOMING",
                AND: [
                    {
                        startTime: {
                            lt: new Date(dto.endTime)
                        }
                    },
                    {
                        endTime: {
                            gt: new Date(dto.startTime)
                        }
                    }
                ]
            }
        })

        if(existingBooking) {
            throw new BadRequestException("Room already booked for this slot")
        }

        const booking = await this.prisma.booking.create({
            data: {
                userId: userId,
                roomId: dto.roomId,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                status: "UPCOMING"
            }
        })

        return {
            message: "Room booked successfully",
            booking
        };
    }

    async getUpcomingBookings(userId: number) {
        return this.prisma.booking.findMany({
            where: {
                id: userId,
                status : "UPCOMING"
            },
            include: {
                room: true
            }
        })
    }

    async getBookingHistory(userId: number) {
        return this.prisma.booking.findMany({
            where: {
                userId,
                status: {
                    in: [
                        BookingStatus.COMPLETED,
                        BookingStatus.CANCELED,
                        BookingStatus.UPCOMING,
                        BookingStatus.ONGOING
                    ],
                },
            },
            include: {
                room: true,
            },
        });  
    }

    async cancelBooking(bookingId: number,userId: number) {
        const booking = await this.prisma.booking.findUnique({
            where: {
                id: bookingId,
            },
        });
        if (!booking) {
            throw new NotFoundException("Booking not found",);
        }

        if (booking.userId !== userId) {
            throw new ForbiddenException("You can only cancel your own bookings",);
        }

        if (booking.status !== "UPCOMING") {
            throw new BadRequestException("Booking cannot be cancelled",);
        }

        const updatedBooking = await this.prisma.booking.update({
            where: {
                id: bookingId,
            },
            data: {
                status: "CANCELED",
            },
        });

        return {
            message: "Booking cancelled successfully",
            booking: updatedBooking,
        };
    }
}
