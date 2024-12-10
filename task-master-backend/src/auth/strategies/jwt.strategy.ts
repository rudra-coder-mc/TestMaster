import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/users.schema';
import { JWT_SECRET } from 'src/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>, // Inject the user model
  ) {
    super({
      jwtFromRequest: (req) => req.cookies['access_token'], // Extract token from cookies
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET, // Your JWT secret key
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userModel.findById(payload.sub); // Get user by ID from the payload
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user; // Attach user with the role to the request
  }
}
