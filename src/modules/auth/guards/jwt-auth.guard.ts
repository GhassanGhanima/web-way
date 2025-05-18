import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Extract request for custom handling if needed
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check if Authorization header is present
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authentication token');
    }
    
    // Validate format
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid token format');
    }
    
    // Use the default passport authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Log information for debugging purposes
    if (info) {
      console.log('JWT Auth Info:', info.name, info.message);
    }
    
    // Handle specific JWT errors
    if (info instanceof Error) {
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Your session has expired. Please login again.');
      }
      if (info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid authentication token');
      }
    }
    
    // Handle other errors
    if (err) {
      throw err;
    }
    
    // If no user but no error either, it's an authentication failure
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    
    return user;
  }
}
