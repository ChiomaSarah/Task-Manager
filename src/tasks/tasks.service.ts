import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity, TaskStatus } from './entities/task.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity) private taskRepo: Repository<TaskEntity>,
  ) {}

  public async createTask(
    createTaskDto: CreateTaskDto,
    user: UserEntity,
  ): Promise<TaskEntity> {
    try {
      const data = this.taskRepo.create({
        ...createTaskDto,
        status: TaskStatus.OPEN,
        userId: user.id,
      });
      return await this.taskRepo.save(data);
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  public async getTasks(user: UserEntity): Promise<TaskEntity[]> {
    const query = this.taskRepo.createQueryBuilder('tasks');
    query.where(`tasks.userId = :userId`, { userId: user.id });
    try {
      return await query.getMany();
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  public async getTask(id: string, user: UserEntity): Promise<TaskEntity> {
    try {
      const task = await this.taskRepo.findOne({
        where: { id, userId: user.id },
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      return task;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  public async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: UserEntity,
  ): Promise<TaskEntity> {
    try {
      await this.taskRepo.update(id, updateTaskDto);

      const updatedTask = await this.taskRepo.findOne({
        where: { id, userId: user.id },
      });
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

  public async deleteTask(
    id: string,
    user: UserEntity,
  ): Promise<{ message: string }> {
    try {
      const task = await this.taskRepo.findOne({
        where: { id, userId: user.id },
      });
      if (!task) {
        throw new NotFoundException({
          message: `Sorry, the content you seek, was not found and may have been deleted.`,
        });
      }
      await this.taskRepo.delete({ id });
      return { message: 'Task Deleted successfully!' };
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }
}
