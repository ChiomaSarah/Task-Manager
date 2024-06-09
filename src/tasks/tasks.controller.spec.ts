import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskEntity, TaskStatus } from './entities/task.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            createTask: jest.fn(),
            getTasks: jest.fn(),
            getTask: jest.fn(),
            updateTask: jest.fn(),
            deleteTask: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addTask', () => {
    it('should call createTask in the TasksService and return the created task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        createdOn: new Date(),
      };
      const user: UserEntity = { id: '1' } as any;
      const createdTask: TaskEntity = {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        userId: '1',
        status: TaskStatus.OPEN,
        createdOn: new Date(),
        updatedOn: new Date(),
        user,
      };

      jest.spyOn(tasksService, 'createTask').mockResolvedValue(createdTask);

      const result = await controller.addTask(createTaskDto, user);

      expect(tasksService.createTask).toHaveBeenCalledWith(createTaskDto, user);
      expect(result).toEqual(createdTask);
    });
  });

  describe('getAllTasks', () => {
    it('should call getTasks in the TasksService and return the tasks', async () => {
      const user: UserEntity = { id: '1' } as any;
      const tasks: TaskEntity[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          userId: '1',
          status: TaskStatus.OPEN,
          createdOn: new Date(),
          updatedOn: new Date(),
          user,
        },
      ];

      jest.spyOn(tasksService, 'getTasks').mockResolvedValue(tasks);

      const result = await controller.getAllTasks(user);

      expect(tasksService.getTasks).toHaveBeenCalledWith(user);
      expect(result).toEqual(tasks);
    });
  });

  describe('getSingleTask', () => {
    it('should throw NotFoundException if task is not found', async () => {
      const user = { id: '1' } as UserEntity;

      jest
        .spyOn(tasksService, 'getTask')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.getSingleTask('1', user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a task if found', async () => {
      const user = { id: '1' } as UserEntity;
      const task = { id: '1', title: 'Test Task' };

      jest.spyOn(tasksService, 'getTask').mockResolvedValue(task as any);

      const result = await controller.getSingleTask('1', user);

      expect(result).toEqual(task);
    });
  });

  describe('updateTask', () => {
    it('should call updateTask in the TasksService and return the updated task', async () => {
      const user: UserEntity = { id: '1' } as any;
      const updatedTask: TaskEntity = {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        userId: '1',
        status: TaskStatus.OPEN,
        createdOn: new Date(),
        updatedOn: new Date(),
        user,
      };

      jest.spyOn(tasksService, 'updateTask').mockResolvedValue(updatedTask);

      const result = await controller.updateTask(
        '1',
        { title: 'Updated Task', description: 'Updated Description' },
        user,
      );

      expect(tasksService.updateTask).toHaveBeenCalledWith(
        '1',
        { title: 'Updated Task', description: 'Updated Description' },
        user,
      );
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should call deleteTask in the TasksService and return a success message', async () => {
      const user: UserEntity = { id: '1' } as any;

      jest
        .spyOn(tasksService, 'deleteTask')
        .mockResolvedValue({ message: 'Task Deleted successfully!' });

      const result = await controller.remove('1', user);

      expect(tasksService.deleteTask).toHaveBeenCalledWith('1', user);
      expect(result).toEqual({ message: 'Task Deleted successfully!' });
    });

    it('should throw NotFoundException if task is not found', async () => {
      const user: UserEntity = { id: '1' } as any;
      jest
        .spyOn(tasksService, 'deleteTask')
        .mockRejectedValue(new NotFoundException('Task not found'));

      await expect(controller.remove('1', user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
