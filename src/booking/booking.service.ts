import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { checkAvailabilityDto } from './dto/check-availability.dto';
import { BookRoomDto } from './dto/book-room.dto';
import { BookingStatus } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class BookingService {
    constructor(private prisma: PrismaService, @InjectPinoLogger(BookingService.name) private readonly logger: PinoLogger) {};
    async checkAvailability(dto: checkAvailabilityDto) {
        this.logger.info({startTime: dto.startTime, endTime: dto.endTime}, "Checking room availabilty")
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
        this.logger.info({availableRooms : availableRooms.length}, "Availability check completed");
        return availableRooms;
    }

    async bookRoom(dto: BookRoomDto, userId: number) {
        this.logger.info({userId, roomId: dto.roomId}, "Room booking started")
        const room = await this.prisma.room.findUnique({
            where: {
                id: dto.roomId
            }
        })

        if(!room) {
            this.logger.warn({roomId: dto.roomId}, 'Booking failed - room not found')
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
            this.logger.warn({roomId: dto.roomId, userId}, "Booing failed - slot already booked")
            throw new BadRequestException("Room already booked for this slot")
        }

        const booking = await this.prisma.booking.create({
            data: {
                userId: userId,
                roomId: dto.roomId,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                meetingDescription: dto.meetingDescription,
                status: "UPCOMING"
            }
        })

        this.logger.info({bookingId: booking.id, roomId: dto.roomId, userId}, 'Room booked successfully')

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
        this.logger.debug({ userId },'Fetching booking history');
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

    async getAllBookings() {
        this.logger.debug("Fetching  all bookings")
        const bookings = await this.prisma.booking.findMany({
            include: {
                room: true,
                user: true
            }
        })
        this.logger.info({ count: bookings.length }, "All bookings fetched")
        return bookings;        
    }

    async cancelBooking(bookingId: number,userId: number) {
        this.logger.info({bookingId, userId}, 'Booking cancellation requested')
        const booking = await this.prisma.booking.findUnique({
            where: {
                id: bookingId,
            },
        });
        if (!booking) {
            this.logger.warn({bookingId}, "Cancellation failed -  booking not found")
            throw new NotFoundException("Booking not found",);
        }

        if (booking.userId !== userId) {
            this.logger.info({bookingId,userId}, "Cancellation failed - unauthorized user")
            throw new ForbiddenException("You can only cancel your own bookings",);
        }

        if (booking.status !== "UPCOMING") {
             this.logger.warn({bookingId,status: booking.status},'Cancellation failed - invalid status');

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

         this.logger.info({bookingId,userId,},'Booking cancelled successfully');

        return {
            message: "Booking cancelled successfully",
            booking: updatedBooking,
        };
    }

    async getUnavailableSlots(roomId: number, date: string) {
        this.logger.info({roomId,date}, "Fetching unavailable slots");

        const dayStart = new Date(`${date}T00:00:00+05:30`);
        const dayEnd   = new Date(`${date}T23:59:59+05:30`);

        const bookings =  await this.prisma.booking.findMany({
            where: {
                roomId,
                status: { in: ["UPCOMING","ONGOING"]},
                startTime: {lt: dayEnd},
                endTime: {gt: dayStart}
            },
            select: {startTime: true, endTime: true}
        })

        const room = await this.prisma.room.findUnique({
            where: {
                id: roomId
            },
            select: {
                maintenanceStart: true,
                maintenanceEnd: true,
                status: true
            }
        })

        const blockedRanges: {start: Date; end: Date}[] = [];

        for(const b of bookings) {
            blockedRanges.push({ start: b.startTime, end:b.endTime});
        }

        if(room?.status === "MAINTANENCE" && room.maintenanceStart && room.maintenanceEnd) {
            blockedRanges.push({
                start: room.maintenanceStart,
                end: room.maintenanceEnd
            })
        }

        const unavailableSlots: string[] = [];

        for(let h = 8; h <= 18; h++) {
            for(let m = 0; m < 60; m+=30) {
                if(h === 18 && m > 0) break;

                const slotStart = new Date(`${date}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00+05:30`);
                const slotEnd   = new Date(slotStart.getTime() + 30 * 60 * 1000);

                const isBlocked = blockedRanges.some(range => slotStart < range.end && slotEnd >  range.start);

                if (isBlocked) {
                    const ampm = h < 12 ? "AM" : "PM";
                    const h12  = h > 12 ? h - 12 : h;
                    const label = `${h12}:${m === 0 ? "00" : m} ${ampm}`;
                    unavailableSlots.push(label);
                }
            }
        }
        this.logger.info({ unavailableSlots }, "Unavailable slots fetched");
        return {unavailableSlots};
    }

    async getBookingsByDate(date: string, userId: number) {
        this.logger.info({date, userId}, "Fetching bookings by date");

        const dayStart = new Date(`${date}T00:00:00+05:30`);
        const dayEnd   = new Date(`${date}T23:59:59+05:30`);

        const bookings = await this.prisma.booking.findMany({
            where: {
                userId,
                status: { in: ["UPCOMING", "UPCOMING"]},
                startTime: { gte: dayStart},
                endTime: {lte: dayEnd}
            },
            include: {
                room: true,
                user: true
            },
            orderBy: {
                startTime: "asc"
            }
        });
        this.logger.info({ count: bookings.length }, "Bookings by date fetched");
        return bookings;
    }
}

