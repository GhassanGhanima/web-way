import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { UsersService } from '../../src/modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

describe('Authentication (Integration)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userRepository: Repository<User>;
  
  const testUser = {
    email: 'test-integration@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User'
  };
  
  let userId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    
    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    
    // Clean up any existing test users
    await userRepository.delete({ email: testUser.email });
  });

  afterAll(async () => {
    // Clean up test user
    if (userId) {
      await userRepository.delete(userId);
    }
    await app.close();
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      
      const user = await userRepository.findOne({ where: { email: testUser.email } });
      expect(user).toBeDefined();
      if (user) {
        userId = user.id;
      }
    });

    it('should fail to register with the same email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(400);
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should fail to login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);
      
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      
      // Update tokens for future tests
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should fail to access protected route without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should fail to access protected route with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
