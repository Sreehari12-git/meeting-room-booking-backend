import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async login(email: string,password: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })
        if(!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const match = await bcrypt.compare(password,user.password);

        if(!match) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const token = jwt.sign(
            {
                id: user.id,
                role:user.role
            },
            process.env.JWT_SECRET as string, {
                expiresIn: "2h"
            }
        )

        const refreshToken = jwt.sign(
            {
                id: user.id
            },
            process.env.JWT_REFRESH_SECRET as string, {
                expiresIn: "7d"
            }
        )

        return {
            message: "Login success",
            token,
            refreshToken,
            user: {
                id: user.id,
                role: user.role
            }
        }
    }
}

