import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            userSignUp: jest.fn(),
            userSignIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should call userSignUp in the UserService and return the created user', async () => {
      const registerUserDto: RegisterUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };
      const createdUser = {} as any;

      jest.spyOn(userService, 'userSignUp').mockResolvedValue(createdUser);

      const result = await controller.createUser(registerUserDto);

      expect(userService.userSignUp).toHaveBeenCalledWith(registerUserDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('loginUser', () => {
    it('should call userSignIn in the UserService and return the login result', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResult = { token: 'jwt_token', message: 'Login Successful!' };

      jest.spyOn(userService, 'userSignIn').mockResolvedValue(loginResult);

      const result = await controller.loginUser(loginDto);

      expect(userService.userSignIn).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResult);
    });

    it('should throw UnauthorizedException if login fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest
        .spyOn(userService, 'userSignIn')
        .mockRejectedValue(new UnauthorizedException());

      await expect(controller.loginUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
