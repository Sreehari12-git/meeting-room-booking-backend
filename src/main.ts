import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from "cookie-parser"
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useLogger(app.get(Logger));
  
  const allowedOrigins = process.env.ALLOWORIGINLIST ?? true ;

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
