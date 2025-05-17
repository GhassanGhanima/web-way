import { Body, Controller, Post, Version, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService, // Add this line
  ) {}
  @Post('login')
  @Version('1')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT tokens',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Version('1')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('refresh')
  @Version('1')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Returns new JWT tokens',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Get('google')
  @Version('1')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google authentication page',
  })
  async googleAuth() {
    // This endpoint initiates Google OAuth flow
    // The actual implementation is handled by PassportJS
  }

  @Get('google/callback')
  @Version('1')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT tokens after successful Google authentication',
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.generateTokens(req.user);
    
    // Redirect to frontend with tokens
    const redirectUrl = new URL(this.configService.get<string>('APP_URL') + '/auth/callback');
    redirectUrl.searchParams.append('accessToken', accessToken);
    redirectUrl.searchParams.append('refreshToken', refreshToken);
    
    return res.redirect(redirectUrl.toString());
  }
}
