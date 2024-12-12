import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { Task } from './task.schema';
import mongoose from 'mongoose';

describe('TaskController', () => {
  let controller: TaskController;
  let mockTaskService: jest.Mocked<TaskService>;

  const mockTask = {
    _id: 'taskId123',
    title: 'Test Task',
    description: 'Test Description',
    dueDate: new Date(),
    assignedTo: [new mongoose.Types.ObjectId()],
    priority: 'medium',
    status: 'pending',
  } as unknown as Task;

  const mockRequest = {
    user: {
      _id: 'userId123',
      role: 'admin',
    },
  };

  beforeEach(async () => {
    mockTaskService = {
      findTasksWithFilters: jest.fn(),
      create: jest.fn(),
      assignTask: jest.fn(),
      unassignTask: jest.fn(),
      delete: jest.fn(),
      findTaskById: jest.fn(),
      update: jest.fn(),
      changeStatus: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const mockTasks = [mockTask];
      mockTaskService.findTasksWithFilters.mockResolvedValue(mockTasks);

      const result = await controller.findAll();
      expect(result).toEqual({ success: true, data: mockTasks });
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      mockTaskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(mockTask);
      expect(result).toEqual({ success: true, data: mockTask });
    });
  });

  describe('findFilteredTasksByUser', () => {
    it('should return filtered tasks for user', async () => {
      const mockTasks = [mockTask];
      mockTaskService.findTasksWithFilters.mockResolvedValue(mockTasks);

      const result = await controller.findFilteredTasksByUser(
        'userId123',
        'pending',
        'medium',
        '2024-01-01',
        mockRequest,
      );

      expect(result).toEqual({ success: true, data: mockTasks });
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      const unauthorizedRequest = {
        user: { _id: 'differentUserId', role: 'user' },
      };

      await expect(
        controller.findFilteredTasksByUser(
          'userId123',
          'pending',
          'medium',
          '2024-01-01',
          unauthorizedRequest,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      mockTaskService.findTaskById.mockResolvedValue(mockTask);
      mockTaskService.changeStatus.mockResolvedValue({
        ...mockTask,
        status: 'completed',
      } as Task);

      const result = await controller.updateStatus(
        'taskId123',
        { status: 'completed' } as unknown as Task,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('completed');
    });

    it('should throw BadRequestException for invalid status', async () => {
      mockTaskService.findTaskById.mockResolvedValue(mockTask);

      await expect(
        controller.updateStatus(
          'taskId123',
          { ...mockTask, status: 'invalid' } as any,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
