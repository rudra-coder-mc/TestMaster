import {
  Controller,
  Get,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from './users.schema';

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
      return { success: true, data: users };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users', error);
    }
  }
}
