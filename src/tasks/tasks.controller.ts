import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  addTask(@Body(ValidationPipe) data: CreateTaskDto) {
    return this.tasksService.createTask(data);
  }

  @Get()
  getAllTasks() {
    return this.tasksService.getTasks();
  }

  @Get(':id')
  getSingleTask(@Param('id') id: string) {
    return this.tasksService.getTask(id);
  }

  @Patch(':id')
  updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }
}
