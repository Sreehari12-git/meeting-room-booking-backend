import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEnum(Role)
    role!: Role;

    @IsEmail()
    email!: string

    @MinLength(6)
    password!: string

    @IsString()
    name!: string

}