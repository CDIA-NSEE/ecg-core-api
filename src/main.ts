import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './shared';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  // Create app with explicit options
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    logger: ['error', 'warn', 'log'],
    bufferLogs: true,
  });
  
  const configService = app.get(ConfigService);

  // Enhanced security headers with CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      xssFilter: true,
      noSniff: true,
      hidePoweredBy: true,
    })
  );

  // Additional security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // CORS configuration with more restrictive settings for production
  const corsOrigin = process.env.NODE_ENV === 'production' 
    ? configService.get<string>('CORS_ORIGIN').getOrDefault('*')
    : '*';
    
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
    maxAge: 3600,
  });

  // Enhanced compression for better performance
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 0, // Compress all responses
      level: 6, // Compression level (0-9, 9 being best compression but slowest)
    })
  );

  // Note: ThrottlerGuard and CacheInterceptor are now provided via APP_GUARD and APP_INTERCEPTOR
  // in the AppModule, so we don't need to apply them globally here

  // Global validation pipe with enhanced security
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transformOptions: {
        enableImplicitConversion: true, // Automatically transform types
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide error details in production
    }),
  );

  // Set request timeout
  app.use((req, res, next) => {
    res.setTimeout(30000, () => {
      res.status(408).end('Request Timeout');
    });
    next();
  });

  // Swagger setup - only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ECG Core API')
      .setDescription('REST API documentation for ECG Core API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('exams', 'ECG exam management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: false,
      ignoreGlobalPrefix: false,
    });
    SwaggerModule.setup('api', app, document);
  }

  // Configure keep-alive for better performance with long-running connections
  const server = app.getHttpServer();
  server.keepAliveTimeout = 65000; // Slightly higher than the ALB idle timeout
  server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

  // Start server
  const port = configService.port;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
  }
  
  // Implement graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`Received ${signal}, shutting down gracefully`);
      await app.close();
      process.exit(0);
    });
  }
}

bootstrap();
