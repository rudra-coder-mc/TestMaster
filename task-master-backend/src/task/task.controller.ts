import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/users/users.schema';
import { Task, TaskStatus } from './task.schema';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Admin routes
  @Get('all')
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async findAll() {
    const tasks = await this.taskService.findTasksWithFilters({});
    return { success: true, data: tasks };
  }

  @Post('create')
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async create(@Body() task: Task) {
    const newTask = await this.taskService.create(task);
    return { success: true, data: newTask };
  }

  @Post('assign')
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async assignTask(@Body() body: { taskId: string; userIds: string[] }) {
    const task = await this.taskService.assignTask(body.taskId, body.userIds);
    return { success: true, data: task };
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: string) {
    const task = await this.taskService.delete(id);
    return { success: true, data: task };
  }

  // User routes
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const task = await this.taskService.findTaskById(id);
    this.checkTaskPermission(user, task);
    return { success: true, data: task };
  }

  @Get('filter/user/:id') // Combined route
  async findFilteredTasksByUser(
    @Param('id') userId: string,
    @Query('status') status: string,
    @Query('priority') priority: string,
    @Query('dueDate') dueDate: string,
    @Request() req,
  ) {
    const user = req.user;

    // Ensure that the user is either an admin or the task owner
    if (user.role !== UserRole.Admin && user._id.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view tasks for this user',
      );
    }

    // Build the query for filters
    const query = this.buildQuery(status, priority, dueDate, userId);

    // Fetch tasks using the combined query
    const tasks = await this.taskService.findTasksWithFilters(query);

    if (tasks.length === 0) {
      return {
        data: [],
        message: 'No tasks match the given query',
        success: true,
      };
    }

    return { success: true, data: tasks };
  }

  @Put('update/:id')
  async updateTask(
    @Param('id') id: string,
    @Body() task: Task,
    @Request() req,
  ) {
    const user = req.user;
    const taskToUpdate = await this.taskService.findTaskById(id);
    this.checkTaskPermission(user, taskToUpdate);
    const updatedTask = await this.taskService.update(id, task);
    return { success: true, data: updatedTask };
  }

  @Delete('delete/:id')
  async deleteTask(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const taskToDelete = await this.taskService.findTaskById(id);
    this.checkTaskPermission(user, taskToDelete);
    const deletedTask = await this.taskService.delete(id);
    return { success: true, data: deletedTask };
  }

  @Put('updateStatus/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() task: Task,
    @Request() req,
  ) {
    const user = req.user;
    const taskToUpdate = await this.taskService.findTaskById(id);
    this.checkTaskPermission(user, taskToUpdate);

    this.validateStatus(task.status);

    const updatedTask = await this.taskService.changeStatus(id, task.status);
    return { success: true, data: updatedTask };
  }

  // Helper method to check if the user has permission to access the task.
  private checkTaskPermission(user: any, task: Task) {
    if (
      user.role !== UserRole.Admin &&
      task.assignedTo.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException(
        'You are not authorized to access this task',
      );
    }
  }

  private buildQuery(
    status: string,
    priority: string,
    dueDate: string,
    userId: string,
  ): any {
    const query: any = { assignedTo: userId }; // Ensure it filters by userId

    if (status) {
      this.validateStatus(status);
      query.status = status;
    }

    if (priority) {
      this.validatePriority(priority);
      query.priority = priority;
    }

    if (dueDate) {
      query.dueDate = this.parseDueDate(dueDate);
    }

    return query;
  }

  private validateStatus(status: string) {
    const validStatuses = [
      'pending',
      'completed',
      'cancelled',
      'not-started',
      'in-progress',
      'on-hold',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status value: ${status}`);
    }
  }

  private validatePriority(priority: string) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      throw new BadRequestException(`Invalid priority value: ${priority}`);
    }
  }

  private parseDueDate(dueDate: string): Date | any {
    const dueDateRange = dueDate.split(',');
    if (dueDateRange.length === 2) {
      const [startDate, endDate] = dueDateRange.map((date) => new Date(date));
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException(`Invalid date range format: ${dueDate}`);
      }
      return { $gte: startDate, $lte: endDate };
    } else {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(`Invalid date format: ${dueDate}`);
      }
      return date;
    }
  }
}
