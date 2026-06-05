import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from "cookie-parser"
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useLogger(app.get(Logger));
  
  const allowedOrigins = process.env.ALLOWORIGINLIST ?? true ;

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    const config = new DocumentBuilder().setTitle('Meeting Room API').setDescription('API Documentation for Meeting Room management').setVersion('1.0').addTag('cats').addBearerAuth().build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
