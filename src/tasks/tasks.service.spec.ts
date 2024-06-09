import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskEntity, TaskStatus } from './entities/task.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<TaskEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(TaskEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<TaskEntity>>(
      getRepositoryToken(TaskEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Task 1',
        description: 'Description 1',
        createdOn: new Date(),
      };
      const user = { id: '1' } as any;

      jest.spyOn(repository, 'create').mockReturnValue(createTaskDto as any);
      jest.spyOn(repository, 'save').mockResolvedValue(createTaskDto as any);

      const result = await service.createTask(createTaskDto, user);

      expect(repository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        status: TaskStatus.OPEN,
        userId: user.id,
      });
      expect(repository.save).toHaveBeenCalledWith(createTaskDto);
      expect(result).toEqual(createTaskDto);
    });

    it('should throw BadRequestException if an error occurs', async () => {
      const createTaskDto = {
        title: 'Task 1',
        description: 'Description 1',
        createdOn: new Date(),
      };
      const user = { id: '1' } as any;

      jest.spyOn(repository, 'create').mockReturnValue(createTaskDto as any);
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.createTask(createTaskDto, user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getTasks', () => {
    it('should return tasks for a specific user', async () => {
      const user = { id: '1' } as any;
      const tasks = [
        { id: '1', title: 'Task 1', description: 'Description 1', userId: '1' },
      ] as any;

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(tasks),
      } as any);

      const result = await service.getTasks(user);

      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith(
        'tasks.userId = :userId',
        { userId: user.id },
      );
      expect(result).toEqual(tasks);
    });

    it('should throw BadRequestException if an error occurs', async () => {
      const user = { id: '1' } as any;

      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      await expect(service.getTasks(user)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTask', () => {
    it('should return a task for a specific user', async () => {
      const user = { id: '1' } as any;
      const task = {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        userId: '1',
      } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(task);

      const result = await service.getTask('1', user);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: user.id },
      });
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException if task is not found', async () => {
      const user = { id: '1' } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getTask('1', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if an error occurs', async () => {
      const user = { id: '1' } as any;

      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getTask('1', user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateTask', () => {
    it('should update a task for a specific user', async () => {
      const user = { id: '1' } as any;
      const updatedTask = {
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        userId: '1',
      } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedTask);
      jest.spyOn(repository, 'update').mockResolvedValue(null);

      const result = await service.updateTask(
        '1',
        { title: 'Updated Task', description: 'Updated Description' },
        user,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: user.id },
      });
      expect(repository.update).toHaveBeenCalledWith('1', {
        title: 'Updated Task',
        description: 'Updated Description',
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task is not found', async () => {
      const user = { id: '1' } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateTask(
          '1',
          { title: 'Updated Task', description: 'Updated Description' },
          user,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if an error occurs', async () => {
      const user = { id: '1' } as any;
      const updatedTask = {
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        userId: '1',
      } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedTask);
      jest
        .spyOn(repository, 'update')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateTask(
          '1',
          { title: 'Updated Task', description: 'Updated Description' },
          user,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task for a specific user', async () => {
      const user = { id: '1' } as any;
      const deletedTask = {
        id: '1',
        title: 'Deleted Task',
        description: 'Deleted Description',
        userId: '1',
      } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(deletedTask);
      jest.spyOn(repository, 'delete').mockResolvedValue(null);

      const result = await service.deleteTask('1', user);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: user.id },
      });
      expect(repository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Task deleted successfully!' });
    });

    it('should throw NotFoundException if task is not found', async () => {
      const user = { id: '1' } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteTask('1', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if an error occurs', async () => {
      const user = { id: '1' } as any;

      jest.spyOn(repository, 'findOne').mockResolvedValue({} as any);
      jest
        .spyOn(repository, 'delete')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.deleteTask('1', user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
