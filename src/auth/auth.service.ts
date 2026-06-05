import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppService } from 'src/app.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, @InjectPinoLogger(AppService.name) private readonly logger: PinoLogger) {}

    async login(email: string,password: string) {
        this.logger.info({email}, "Login attempt")
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })
        if(!user) {
            this.logger.warn({email}, "Login failed - user not found")
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

        this.logger.info({userId: user.id,email: user.email,role: user.role},"User logged in successfully");

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

