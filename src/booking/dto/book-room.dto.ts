import { ApiProperty } from "@nestjs/swagger";

export class BookRoomDto {
    roomId!: number;

    @ApiProperty()
    date!: string;

    @ApiProperty()
    startTime!: string;

    @ApiProperty()
    endTime!: string

    @ApiProperty()
    meetingDescription!: string
}
