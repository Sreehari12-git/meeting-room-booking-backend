import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports : [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, RolesGuard]
})
export class AuthModule {}

