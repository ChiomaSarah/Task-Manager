import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const data = this.repo.create({
        ...createTaskDto,
        status: TaskStatus.OPEN,
      });
      return await this.repo.save(data);
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async getTasks(): Promise<Task[]> {
    try {
      return await this.repo.find();
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async getTask(id: string): Promise<Task> {
    try {
      const task = await this.repo.findOne({ where: { id } });
      if (!task) {
        throw new NotFoundException({
          message: 'Task not found',
        });
      }
      return task;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      await this.repo.update(id, updateTaskDto);

      const updatedTask = await this.repo.findOne({ where: { id } });
      if (!updatedTask) {
        throw new NotFoundException({
          message: 'Task not found',
        });
      }
      return updatedTask;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async deleteTask(id: string): Promise<Task> {
    try {
      await this.repo.delete({ id });
      const deletedTask = await this.repo.findOne({ where: { id } });
      if (!deletedTask) {
        throw new NotFoundException({
          message: `Sorry, the content you seek, was not found and may have been deleted.`,
        });
      }
      return deletedTask;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }
}
