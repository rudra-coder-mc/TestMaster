import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getModelToken } from '@nestjs/mongoose';
import { Task, TaskStatus } from './task.schema';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import mongoose from 'mongoose';

describe('TaskService', () => {
  let service: TaskService;
  let mockTaskModel: any;

  const mockTask = {
    _id: 'taskId123',
    title: 'Test Task',
    description: 'Test Description',
    dueDate: new Date(),
    assignedTo: [new mongoose.Types.ObjectId()],
    priority: 'medium',
    status: 'pending',
    save: jest.fn().mockResolvedValue(undefined),
  } as unknown as Task & { save: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockTaskModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() }),
      find: jest.fn().mockReturnValue({ exec: jest.fn() }),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  describe('findTaskById', () => {
    it('should return a task by id', async () => {
      mockTaskModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const result = await service.findTaskById('taskId123');
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findTaskById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle database errors', async () => {
      mockTaskModel.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findTaskById('taskId123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('changeStatus', () => {
    it('should update task status', async () => {
      mockTaskModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });
      mockTask.save.mockResolvedValue({ ...mockTask, status: 'completed' });

      const result = await service.changeStatus(
        'taskId123',
        'completed' as TaskStatus,
      );
      expect(result.status).toBe('completed');
    });

    it('should handle save errors', async () => {
      mockTaskModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });
      mockTask.save.mockRejectedValue(new Error('Save error'));

      await expect(
        service.changeStatus('taskId123', 'completed' as TaskStatus),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('assignTask', () => {
    const validUserId = new mongoose.Types.ObjectId().toString();

    it('should assign users to task', async () => {
      mockTaskModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });
      mockTask.save.mockResolvedValue({
        ...mockTask,
        assignedTo: [new mongoose.Types.ObjectId(validUserId)],
      });

      const result = await service.assignTask('taskId123', [validUserId]);
      expect(result.assignedTo).toBeDefined();
      expect(result.assignedTo.length).toBe(1);
    });

    it('should throw BadRequestException for empty user ids array', async () => {
      await expect(service.assignTask('taskId123', [])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid user ids', async () => {
      await expect(
        service.assignTask('taskId123', ['invalid-id']),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle database errors during assignment', async () => {
      mockTaskModel.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(
        service.assignTask('taskId123', [validUserId]),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findTasksWithFilters', () => {
    it('should return filtered tasks', async () => {
      const mockTasks = [mockTask];
      mockTaskModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTasks),
      });

      const result = await service.findTasksWithFilters({
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(),
      });
      expect(result).toEqual(mockTasks);
    });

    it('should handle invalid assigned user ID', async () => {
      await expect(
        service.findTasksWithFilters({
          assignedTo: 'invalid-id',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return empty array when no tasks found', async () => {
      mockTaskModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findTasksWithFilters({});
      expect(result).toEqual([]);
    });

    it('should handle database errors during filtering', async () => {
      mockTaskModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findTasksWithFilters({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const taskToCreate = { ...mockTask };
      mockTaskModel.create.mockResolvedValue(taskToCreate);

      const result = await service.create(taskToCreate as unknown as Task);
      expect(result).toEqual(taskToCreate);
    });

    it('should handle creation errors', async () => {
      mockTaskModel.create.mockRejectedValue(new Error('Creation error'));

      await expect(service.create(mockTask)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Title' };
      mockTaskModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTask),
      });

      const result = await service.update(
        'taskId123',
        updatedTask as unknown as Task,
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when updating non-existent task', async () => {
      mockTaskModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('nonexistent', mockTask)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unassignTask', () => {
    it('should unassign users from task', async () => {
      const userIdToRemove = mockTask.assignedTo[0].toString();
      mockTaskModel.findById.mockResolvedValue({
        ...mockTask,
        assignedTo: mockTask.assignedTo,
        save: jest.fn().mockResolvedValue({
          ...mockTask,
          assignedTo: [],
        }),
      });

      const result = await service.unassignTask('taskId123', [userIdToRemove]);
      expect(result.assignedTo).toHaveLength(0);
    });

    it('should throw NotFoundException for non-existent task', async () => {
      mockTaskModel.findById.mockResolvedValue(null);

      await expect(
        service.unassignTask('nonexistent', ['userId']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('error handling', () => {
    it('should properly handle and transform errors', async () => {
      mockTaskModel.findById.mockImplementation(() => {
        throw new Error('Unknown error');
      });

      await expect(service.findTaskById('taskId123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should preserve NotFoundException', async () => {
      const notFoundError = new NotFoundException('Test error');
      mockTaskModel.findById.mockImplementation(() => {
        throw notFoundError;
      });

      await expect(service.findTaskById('taskId123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
