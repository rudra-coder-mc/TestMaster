import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { NODE_ENV } from 'src/config';

@Controller('auth')
@UseGuards() // Disable global guards for this controller
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   * @param body - { username: string, email: string, password: string }
   * @returns The created user or a success message.
   */
  @Post('register')
  async register(
    @Body() body: { username: string; email: string; password: string },
  ) {
    try {
      const user = await this.userService.create(
        body.username,
        body.email,
        body.password,
      );
      return { message: 'User registered successfully', user };
    } catch (error) {
      throw new BadRequestException('Error registering user', error);
    }
  }

  /**
   * Login user and generate JWT token.
   * @param body - { email: string, password: string }
   * @param res - Express response object to send the token in a cookie.
   * @returns Success message if login is successful.
   */
  @UseGuards(LocalAuthGuard) // Use LocalAuthGuard for login only
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.login(body.email, body.password);
      const payload = { email: user.email, _id: user._id, role: user.type };
      const accessToken = this.generateAccessToken(payload);

      this.setCookie(res, accessToken, payload);

      return res.send({ message: 'Logged in successfully' });
    } catch (error) {
      throw new BadRequestException('Invalid credentials', error);
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      path: '/', // Ensure path matches
      sameSite: 'none', // Corrected to lowercase 'none'
      secure: true, // Ensure the secure flag matches
    });
    res.clearCookie('role', {
      path: '/', // Ensure path matches
      sameSite: 'none', // Corrected to lowercase 'none'
      secure: true, // Ensure the secure flag matches
    });

    return res.send({ message: 'Logged out successfully' });
  }

  /**
   * Generate JWT access token.
   * @param payload - Payload containing user info.
   * @returns The signed JWT token.
   */
  private generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  /**
   * Set the JWT token as an HTTP-only cookie.
   * @param res - Express response object.
   * @param accessToken - The JWT token to be set.
   */
  private setCookie(
    res: Response,
    accessToken: string,
    user: { email: string; _id: string; role: string },
  ): void {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production', // Ensures the cookie is sent over HTTPS in production
      sameSite: 'none', // Corrected to lowercase 'none'
      maxAge: 60 * 60 * 1000, // Token expires after 1 hour
    });
    res.cookie('user', user, {
      secure: NODE_ENV === 'production', // Ensures the cookie is sent over HTTPS in production
      sameSite: 'none', // Corrected to lowercase 'none'
      maxAge: 60 * 60 * 1000, // Token expires after 1 hour
    });
  }
}
