import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.cookies?.token;

            if(!token) {
                throw new UnauthorizedException("No token provided");
            }

            const decoded = jwt.verify(token,process.env.JWT_SECRET as string);

            req["user"] = decoded;
            next();
        }
        catch {
            throw new  UnauthorizedException("Invalid token");
        }
    }
}

