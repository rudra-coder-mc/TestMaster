import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Find user by email.
   * Returns undefined if user does not exist.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error finding user by email',
        error,
      );
    }
  }

  /**
   * Get all users.
   */
  async getAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users', error);
    }
  }

  /**
   * Create a new user.
   * Hash the password and check if user already exists.
   */
  async create(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    try {
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating new user', error);
    }
  }
}
