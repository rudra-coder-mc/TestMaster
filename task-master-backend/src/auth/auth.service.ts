import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/users.schema';
import { ErrorService } from 'src/common/services/error.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      return user.toObject({
        versionKey: false,
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        },
      });
    } catch (error) {
      ErrorService.handleError(error, 'Error validating user credentials');
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const validUser = await this.validateUser(email, password);
      if (!validUser) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return validUser;
    } catch (error) {
      ErrorService.handleError(error, 'Error during login process');
    }
  }
}
