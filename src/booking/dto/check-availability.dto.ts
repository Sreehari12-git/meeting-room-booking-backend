import { ApiProperty } from "@nestjs/swagger";

export class checkAvailabilityDto {
    date!: string;

    @ApiProperty()
    startTime!: string;

    @ApiProperty()
    endTime!: string
}