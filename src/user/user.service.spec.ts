import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        JwtService,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('userSignUp', () => {
    it('should create a new user', async () => {
      const registerUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const newUser = new UserEntity();
      newUser.username = registerUserDto.username;
      newUser.email = registerUserDto.email;

      newUser.password = 'hashedPassword';

      jest.spyOn(userRepository, 'create').mockReturnValue(newUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

      const result = await service.userSignUp(registerUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(newUser);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should throw BadRequestException if an error occurs', async () => {
      const registerUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'create').mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.userSignUp(registerUserDto)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('userSignIn', () => {
    it('should sign in a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = new UserEntity();
      user.email = loginDto.email;
      user.password = await bcrypt.hash(loginDto.password, 12);

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');

      const result = await service.userSignIn(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id });
      expect(result.token).toEqual('jwt_token');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.userSignIn(loginDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = new UserEntity();
      user.email = loginDto.email;
      user.password = await bcrypt.hash('incorrect_password', 12);

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.userSignIn(loginDto)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
