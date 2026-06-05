import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request,Response } from 'express';
import jwt from "jsonwebtoken"

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login") 
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response){
        const result = await  this.authService.login(
            body.email,
            body.password
        );
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.cookie("token", result.token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 2 * 60 * 60 * 1000
        })

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return result
    }

    @Post("logout")
    async logout(@Res({passthrough : true}) res: Response) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        });
        return {
            message: "Logged out successfully"
        }
    }

    @Post("refresh")
    async refresh (@Req() req: Request, @Res({passthrough: true}) res: Response) {
        const refreshToken = req.cookies.refreshtoken;

        if(!refreshToken) {
            throw new UnauthorizedException("No refresh token");
        }

        try {
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET as string
            ) as any;

            const newAccessToken = jwt.sign(
                {
                    id: decoded.id,
                    role: decoded.role
                },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: "2h"
                }
            );

            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie("token", newAccessToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                maxAge: 2 * 60 * 60 * 1000
            });

            return {
                token: newAccessToken
            };

        } catch(error) {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }   

    @Get('me')
    getMe(@Req() req: Request) {
        return req["user"];
    }
}

