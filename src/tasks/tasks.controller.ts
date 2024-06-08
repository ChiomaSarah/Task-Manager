import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from 'src/user/entities/user.entity';
import { User } from 'src/user/user.decorator';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  public async addTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @User() user: UserEntity,
  ) {
    return await this.tasksService.createTask(createTaskDto, user);
  }

  @Get()
  public async getAllTasks(@User() user: UserEntity) {
    return await this.tasksService.getTasks(user);
  }

  @Get(':id')
  public async getSingleTask(
    @Param('id') id: string,
    @User() user: UserEntity,
  ) {
    return await this.tasksService.getTask(id, user);
  }

  @Patch(':id')
  public async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() user: UserEntity,
  ) {
    return await this.tasksService.updateTask(id, updateTaskDto, user);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string, @User() user: UserEntity) {
    return await this.tasksService.deleteTask(id, user);
  }
}
