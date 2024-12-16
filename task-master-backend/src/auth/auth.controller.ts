import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ErrorService } from '../common/services/error.service';
import { NODE_ENV } from 'src/config';

// Add DTOs for better validation
class RegisterDto {
  username: string;
  email: string;
  password: string;
}

class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
@UseGuards()
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(
    @Body(new ValidationPipe()) body: RegisterDto,
    @Res() res: Response,
  ) {
    try {
      // Validate input
      if (!body.email || !body.password || !body.username) {
        throw new BadRequestException('Missing required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Validate password strength
      if (body.password.length < 8) {
        throw new BadRequestException(
          'Password must be at least 8 characters long',
        );
      }

      const user = await this.userService.create(
        body.username,
        body.email,
        body.password,
      );

      // Remove sensitive data before sending response
      const sanitizedUser = {
        id: user._id,
        username: user.username,
        email: user.email,
        type: user.type,
      };

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: sanitizedUser,
      });
    } catch (error) {
      ErrorService.handleError(
        error,
        'Registration failed. Please try again later.',
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body(new ValidationPipe()) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      if (!body.email || !body.password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.authService.login(body.email, body.password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { email: user.email, _id: user._id, role: user.type };
      const accessToken = this.generateAccessToken(payload);

      // Set cookies with proper options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only use secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 60 * 60 * 1000, // 1 hour
      };

      res.cookie('access_token', accessToken, {
        ...cookieOptions,
        sameSite: NODE_ENV === 'production' ? 'strict' : ('lax' as const),
      });
      res.cookie('user', JSON.stringify(payload), {
        ...cookieOptions,
        sameSite: NODE_ENV === 'production' ? 'strict' : ('lax' as const),
        httpOnly: false,
      });

      return {
        success: true,
        message: 'Logged in successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: user.type,
          },
        },
      };
    } catch (error) {
      ErrorService.handleError(
        error,
        'Login failed. Please check your credentials and try again.',
      );
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      const cookieOptions = {
        path: '/',
        sameSite: 'none' as const,
        secure: true,
        httpOnly: true,
      };

      res.clearCookie('access_token', cookieOptions);
      res.clearCookie('user', cookieOptions);

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      ErrorService.handleError(error, 'Logout failed. Please try again.');
    }
  }

  private generateAccessToken(payload: any): string {
    try {
      return this.jwtService.sign(payload);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error generating access token',
        error,
      );
    }
  }

  private setCookie(
    res: Response,
    accessToken: string,
    user: { email: string; _id: string; role: string },
  ): void {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 1000,
    };

    try {
      res.cookie('access_token', accessToken, {
        ...cookieOptions,
        httpOnly: true,
      });

      res.cookie('user', JSON.stringify(user), {
        ...cookieOptions,
        httpOnly: false,
      });
    } catch (error) {
      ErrorService.handleError(error, 'Error setting cookies');
    }
  }
}
