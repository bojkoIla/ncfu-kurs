import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(userId: string, createTaskDto: CreateTaskDto) {
    // Проверка, что project - валидный ObjectId
    if (!Types.ObjectId.isValid(createTaskDto.project)) {
      throw new BadRequestException('Invalid project ID');
    }

    const task = new this.taskModel({
      ...createTaskDto,
      project: new Types.ObjectId(createTaskDto.project),
      createdBy: new Types.ObjectId(userId),
    });
    return task.save();
  }

  async findAll(userId: string, filters?: { project?: string; status?: string; priority?: string }) {
    const query: any = { createdBy: new Types.ObjectId(userId) };
    if (filters?.project && Types.ObjectId.isValid(filters.project)) {
      query.project = new Types.ObjectId(filters.project);
    }
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;

    return this.taskModel.find(query).exec();
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskModel.findOne({
      _id: id,
      createdBy: new Types.ObjectId(userId),
    }).exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: string, userId: string, updateData: Partial<CreateTaskDto>) {
    if (updateData.project) {
      if (!Types.ObjectId.isValid(updateData.project)) {
        throw new BadRequestException('Invalid project ID');
      }
      updateData.project = new Types.ObjectId(updateData.project) as any;
    }

    const task = await this.taskModel.findOneAndUpdate(
      { _id: id, createdBy: new Types.ObjectId(userId) },
      updateData,
      { new: true },
    ).exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async delete(id: string, userId: string) {
    const result = await this.taskModel.deleteOne({
      _id: id,
      createdBy: new Types.ObjectId(userId),
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }
    return { message: 'Task deleted' };
  }
}