import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './users.schema';
import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  const mockUser = {
    _id: 'someId',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    type: 'user',
    save: jest.fn(),
  } as unknown as User;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
      find: jest.fn().mockReturnValue({ exec: jest.fn() }),
      create: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should handle errors when finding user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findByEmail('test@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser];
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      });

      const result = await service.getAll();
      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalled();
    });

    it('should handle errors when getting all users', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.getAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));

      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.create(
        'testuser',
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
    });

    it('should handle save errors', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword'));

      mockUserModel.create.mockRejectedValue(new Error('Save error'));

      await expect(
        service.create('testuser', 'test@example.com', 'password123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
