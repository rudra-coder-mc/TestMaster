import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/users.schema';
import { Response } from 'express';

// Mock user data
const mockUser = {
  _id: 'someId',
  email: 'test@example.com',
  username: 'testuser',
  type: 'user',
};

// Mock services
const mockAuthService = {
  login: jest.fn(),
};

const mockUsersService = {
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

// Mock response object
const mockResponse = {
  cookie: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
} as unknown as Response;

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(result.message).toBe('User registered successfully');
      expect(result.user).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        registerDto.username,
        registerDto.email,
        registerDto.password,
      );
    });
  });

  describe('login', () => {
    it('should login user and return success message', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');

      await controller.login(loginDto, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: 'Logged in successfully',
      });
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success message', async () => {
      await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });
});
