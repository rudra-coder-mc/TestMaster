import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  // Helper function to validate user credentials
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null; // Do not log sensitive data like email
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null; // Avoid logging invalid credentials
    }

    // Return the user data without the password field
    return user.toObject({
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.password; // Remove password field from the returned object
        return ret;
      },
    });
  }

  // Main login function to authenticate user
  async login(email: string, password: string): Promise<any> {
    const validUser = await this.validateUser(email, password);
    if (!validUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return the validated user data, excluding sensitive information
    return validUser;
  }
}
