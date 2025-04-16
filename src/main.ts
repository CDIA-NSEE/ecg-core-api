import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './shared';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*').getOrDefault('*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transformOptions: {
        enableImplicitConversion: true, // Automatically transform types
      },
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('NestJS MongoDB Template')
    .setDescription('REST API documentation for NestJS MongoDB Template')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start server
  const port = configService.port;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

bootstrap();
