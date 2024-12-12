import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { InternalServerErrorException } from '@nestjs/common';
import { User } from './users.schema';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: jest.Mocked<UsersService>;

  const mockUsers = [
    {
      _id: '1',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
      type: 'user',
    },
  ] as unknown as User[];

  beforeEach(async () => {
    mockUsersService = {
      getAll: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('findAll', () => {
    it('should return all users successfully', async () => {
      mockUsersService.getAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual({
        success: true,
        data: mockUsers,
      });
      expect(mockUsersService.getAll).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockUsersService.getAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
