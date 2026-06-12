import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { checkAvailabilityDto } from './dto/check-availability.dto';
import { BookRoomDto } from './dto/book-room.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('booking') @UseGuards(RolesGuard)
export class BookingController {
    constructor(private bookingService: BookingService) {}

    @Post("check-availability") @Roles(Role.EMPLOYEE)
    @ApiOperation({ summary: 'Check room availability' })
    @ApiResponse({status: 200,description: 'Availability checked successfully'})
    checkAvailability(@Body() body: checkAvailabilityDto) {
        return this.bookingService.checkAvailability(body);
    }

    @Post("book-room") @Roles(Role.EMPLOYEE)
    @ApiOperation({ summary: 'Book a meeting room' })
    @ApiResponse({status: 201,description: 'Room booked successfully',})
    @ApiResponse({status: 400,description: 'Room is unavailable'})
    bookRoom(@Body() dto: BookRoomDto,  @Req() req: Request,) {
        return this.bookingService.bookRoom(dto, req["user"].id);
    }

    @Get("upcoming") @Roles(Role.EMPLOYEE)
    @ApiOperation({ summary: 'Get upcoming bookings' })
    @ApiResponse({status: 200,description: 'Upcoming bookings fetched successfully'})
    getUpcomingBookings(@Req() req: Request) {
        return this.bookingService.getUpcomingBookings(req["user"].id);
    }

    @Get("history") @Roles(Role.EMPLOYEE)
    @ApiOperation({ summary: 'Get booking history' })
    @ApiResponse({status: 200,description: 'Booking history fetched successfully'})
    getBookingHistory(@Req() req: Request) {
        return this.bookingService.getBookingHistory( req["user"].id);
    }

    @Put(":id") @Roles(Role.EMPLOYEE)
    @ApiOperation({ summary: 'Cancel a booking' })
    @ApiParam({name: 'id',description: 'Booking ID',example: 1,})
    @ApiResponse({status: 200,description: 'Booking cancelled successfully',})
    @ApiResponse({status: 404,description: 'Booking not found'})
    cancelBooking(@Param("id") id: string, @Req() req: Request) {
        return this.bookingService.cancelBooking(Number(id),  req["user"].id);
  }

  @Get("all-bookings") @Roles(Role.ADMIN)
  @ApiOperation({summary: "All bookings"})
  @ApiResponse({status: 200,description: 'All bookings fetched successfully'})
  @ApiResponse({status: 404, description: "Bookings are not found"})
  getAllBookings() {
    return this.bookingService.getAllBookings();
  }

  @Get("unavailable-slots")
  getUnavailableSlots(@Query('roomId') roomId: string, @Query('date') date: string) {
    if(!roomId || !date) {
        throw new BadRequestException("roomId and date are required")
    }
    return this.bookingService.getUnavailableSlots(Number(roomId), date);       
  }

  @Get("by-date") @Roles(Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get bookings by date' })
  @ApiResponse({ status: 200, description: 'Bookings fetched successfully' })
  getBookingsByDate(@Query('date') date: string, @Req() req: Request) {
    if(!date) {
        throw new BadRequestException("Date is required")
    }
    return this.bookingService.getBookingsByDate(date, req["user"].id);
  }
}
