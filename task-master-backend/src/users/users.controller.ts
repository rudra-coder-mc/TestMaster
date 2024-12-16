import {
  Controller,
  Get,
  UseGuards,
  ValidationPipe,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from './users.schema';
import { ErrorService } from '../common/services/error.service';
import { IsMongoId } from 'class-validator';

class UserIdParam {
  @IsMongoId()
  id: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users.
   * Only Admins have access.
   */
  @Get('all')
  @Roles(UserRole.Admin) // Only admins can view all users
  @UseGuards(RolesGuard) // Guard to enforce role-based access
  async findAll() {
    try {
      const users = await this.usersService.getAll();
      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users.map((user) => ({
          id: user._id,
          username: user.username,
          email: user.email,
          type: user.type,
        })),
      };
    } catch (error) {
      ErrorService.handleError(error, 'Error fetching users');
    }
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  async findOne(@Param(new ValidationPipe()) params: UserIdParam) {
    try {
      const user = await this.usersService.getById(params.id);
      if (!user) {
        throw new NotFoundException(`User with ID ${params.id} not found`);
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          type: user.type,
        },
      };
    } catch (error) {
      ErrorService.handleError(error, 'Error fetching user');
    }
  }
}
