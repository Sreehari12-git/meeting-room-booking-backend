import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from "cookie-parser"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
const allowedOrigins = process.env.ALLOWORIGINLIST 
  ? process.env.ALLOWORIGINLIST.split(',') 
  : 'https://meeting-room-booking-frontend.onrender.com';
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
