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
} from '@nestjs/common';
import { TaskService } from './task.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/users/users.schema';
import { Task } from './task.schema';

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

  @Post('unassign')
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async unassignTask(@Body() body: { taskId: string; userIds: string[] }) {
    const task = await this.taskService.unassignTask(body.taskId, body.userIds);
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

  @Get('filter/user/:id')
  async findFilteredTasksByUser(
    @Param('id') userId: string,
    @Query('status') status: string,
    @Query('priority') priority: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const tasks = await this.taskService.findTasksWithFilters({
      status: status || undefined,
      priority: priority as 'low' | 'medium' | 'high' | undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      assignedTo: userId || undefined,
    });

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
}
