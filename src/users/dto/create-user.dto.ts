import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsEnum(Role)
    role!: Role;

    @ApiProperty()
    @IsEmail()
    email!: string

    @ApiProperty()
    @MinLength(6)
    password!: string

    @ApiProperty()
    @IsString()
    name!: string

}