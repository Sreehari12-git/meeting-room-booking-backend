import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationMiddleware } from './auth/middleware/authentication.middleware';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).exclude('auth/login').forRoutes('*');  
  }
}

