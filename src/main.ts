import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable API versioning with URI path versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get('app.defaultVersion'),
  });
  
  // Improved JWT debugging middleware
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('JWT token found in request:', token.substring(0, 20) + '...');
      
      try {
        // Log token info without verification - just for debugging
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('Token payload:', {
            sub: payload.sub,
            email: payload.email,
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'undefined',
          });
          
          // Check if token is expired
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            console.log('⚠️ WARNING: Token appears to be expired');
          }
        }
      } catch (e) {
        console.log('Could not decode token for debugging:', e.message);
      }
    }
    next();
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.enableCors({
    origin: configService.get('security.cors.origin'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // API prefix
  const apiPrefix = configService.get('app.apiPrefix');
  app.setGlobalPrefix(apiPrefix);

  // Setup Swagger documentation
  if (configService.get('swagger.enabled')) {
    const config = new DocumentBuilder()
      .setTitle(configService.get('swagger.title') || 'Default Swagger Title')
      .setDescription(configService.get('swagger.description') || 'Default Swagger Description')
      .setVersion(configService.get('swagger.version') || '1.0')
      .addTag('accessibility', 'Core accessibility features')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('plans', 'Subscription plans')
      .addTag('subscriptions', 'User subscriptions')
      .addTag('payments', 'Payment processing')
      .addTag('integrations', 'Website integrations')
      .addTag('analytics', 'Usage analytics')
      .addTag('admin', 'Admin controls')
      .addTag('reports', 'Reporting features')
      .addTag('cdn', 'Content delivery')
      .addTag('health', 'System health')
      .addTag('files', 'File management')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      })
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    
    SwaggerModule.setup(configService.get('swagger.path') || '/api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(configService.get<number>('app.port') || 3000);
  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
