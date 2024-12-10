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

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  // Helper function to handle task existence checks
  async findTaskById(id: string): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id).exec();
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      return task;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve the task',
        error,
      );
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

  async assignTask(taskId: string, userIds: string[]): Promise<Task> {
    try {
      if (
        userIds.length === 0 ||
        !userIds.every((id) => mongoose.Types.ObjectId.isValid(id))
      ) {
        throw new BadRequestException('Invalid user IDs provided');
      }

      const task = await this.findTaskById(taskId);
      task.assignedTo = userIds.map((id) => new mongoose.Types.ObjectId(id));

      return await task.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error assigning task',
        error.message,
      );
    }
  }

  async findTasksWithFilters(query: any): Promise<any> {
    try {
      const filterQuery: any = {};

      if (query.status) filterQuery.status = query.status;
      if (query.priority) filterQuery.priority = query.priority;
      if (query.dueDate) filterQuery.dueDate = query.dueDate;

      // Handling user filter for assignedTo
      if (query.assignedTo) {
        if (!mongoose.Types.ObjectId.isValid(query.assignedTo)) {
          throw new BadRequestException(
            `Invalid assigned user ID: ${query.assignedTo}`,
          );
        }
        filterQuery.assignedTo = new mongoose.Types.ObjectId(query.assignedTo);
      }

      const tasks = await this.taskModel.find(filterQuery).exec();

      // Return an empty array and a message if no tasks are found
      if (tasks.length === 0) {
        return [];
      }

      return tasks;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to query tasks',
        error.message,
      );
    }
  }

  async create(task: Task): Promise<Task> {
    try {
      const newTask = new this.taskModel(task);
      return await newTask.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating task',
        error.message,
      );
    }
  }

  async update(id: string, task: Task): Promise<Task> {
    try {
      const updatedTask = await this.taskModel
        .findByIdAndUpdate(id, task, { new: true })
        .exec();
      if (!updatedTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      return updatedTask;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update task',
        error.message,
      );
    }
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
}
