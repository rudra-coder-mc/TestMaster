import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const routePath = request.route.path;

    // Skip AuthGuard for specific routes
    if (routePath === '/auth/login' || routePath === '/auth/register') {
      return true;
    }

    // Check for token in cookies
    const token = request.cookies?.access_token;
    if (!token) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded; // Attach user to the request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token', error);
    }
  }
}
