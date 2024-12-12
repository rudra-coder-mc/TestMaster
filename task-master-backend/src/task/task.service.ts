import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskStatus } from './task.schema';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { TaskFilter } from './interfaces/task-filter.interface';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  private handleError(error: any, message: string) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    throw new InternalServerErrorException(message, error.message);
  }

  async findTaskById(id: string): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id).exec();
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      return task;
    } catch (error) {
      this.handleError(error, 'Failed to retrieve the task');
    }
  }

  async findTasksWithFilters(filter: TaskFilter): Promise<Task[]> {
    try {
      const filterQuery: any = {};

      if (filter.status) filterQuery.status = filter.status;
      if (filter.priority) filterQuery.priority = filter.priority;
      if (filter.dueDate) filterQuery.dueDate = filter.dueDate;

      if (filter.assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(filter.assignedTo)) {
          throw new BadRequestException(
            `Invalid assigned user ID: ${filter.assignedTo}`,
          );
        }
        filterQuery.assignedTo = new mongoose.Types.ObjectId(filter.assignedTo);
      }

      return await this.taskModel.find(filterQuery).exec();
    } catch (error) {
      this.handleError(error, 'Failed to query tasks');
    }
  }

  async assignTask(taskId: string, userIds: string[]): Promise<Task> {
    try {
      if (!userIds?.length) {
        throw new BadRequestException('User IDs array cannot be empty');
      }

      if (!userIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new BadRequestException('Invalid user IDs provided');
      }

      const task = await this.findTaskById(taskId);
      task.assignedTo = userIds.map((id) => new mongoose.Types.ObjectId(id));
      return await task.save();
    } catch (error) {
      this.handleError(error, 'Error assigning task');
    }
  }

  async changeStatus(id: string, status: TaskStatus): Promise<Task> {
    try {
      const task = await this.findTaskById(id);
      task.status = status;
      return await task.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating task status',
        error.message,
      );
    }
  }

  async create(task: Task): Promise<Task> {
    try {
      return await this.taskModel.create(task);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating task',
        error.message,
      );
    }
  }

  async update(id: string, task: Task): Promise<Task> {
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, task, { new: true })
      .exec();
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updatedTask;
  }

  async delete(id: string): Promise<Task> {
    try {
      const deletedTask = await this.taskModel.findByIdAndDelete(id).exec();
      if (!deletedTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      return deletedTask;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete task',
        error.message,
      );
    }
  }

  async unassignTask(taskId: string, userIds: string[]) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.assignedTo = task.assignedTo.filter(
      (id) => !userIds.includes(id.toString()),
    );
    return task.save();
  }
}
