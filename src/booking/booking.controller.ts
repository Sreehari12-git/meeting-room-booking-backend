import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { checkAvailabilityDto } from './dto/check-availability.dto';
import { BookRoomDto } from './dto/book-room.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('booking') @UseGuards(RolesGuard)
export class BookingController {
    constructor(private bookingService: BookingService) {}

    @Post("check-availability") @Roles(Role.EMPLOYEE)
    checkAvailability(@Body() body: checkAvailabilityDto) {
        return this.bookingService.checkAvailability(body);
    }

    @Post("book-room") @Roles(Role.EMPLOYEE)
    bookRoom(@Body() dto: BookRoomDto,  @Req() req: Request,) {
        return this.bookingService.bookRoom(dto, req["user"].id);
    }

     @Get("upcoming") @Roles(Role.EMPLOYEE)
    getUpcomingBookings(@Req() req: Request) {
        return this.bookingService.getUpcomingBookings(req["user"].id);
    }

    @Get("history") @Roles(Role.EMPLOYEE)
    getBookingHistory(@Req() req: Request) {
        return this.bookingService.getBookingHistory( req["user"].id);
    }

    @Put(":id") @Roles(Role.EMPLOYEE)
    cancelBooking(@Param("id") id: string, @Req() req: Request) {
        return this.bookingService.cancelBooking(Number(id),  req["user"].id);
  }
}
