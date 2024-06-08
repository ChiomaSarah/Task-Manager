import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  createUser(@Body(ValidationPipe) registerUserDto: RegisterUserDto) {
    return this.userService.userSignUp(registerUserDto);
  }

  @Post('login')
  loginUser(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.userService.userSignIn(loginDto);
  }
}
