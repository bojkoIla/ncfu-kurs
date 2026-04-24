import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TimeEntry } from './schemas/time-entry.schema';

@Injectable()
export class TimeEntriesService {
  private readonly logger = new Logger(TimeEntriesService.name);

  constructor(@InjectModel(TimeEntry.name) private timeEntryModel: Model<TimeEntry>) {}

  async startTimer(userId: string, taskId: string) {
    try {
      // Валидация ID
      if (!userId || !taskId) {
        throw new BadRequestException('userId and taskId are required');
      }
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(taskId)) {
        throw new BadRequestException('Invalid userId or taskId format');
      }

      const userObjectId = new Types.ObjectId(userId);
      const taskObjectId = new Types.ObjectId(taskId);

      // Проверка активного таймера
      const active = await this.timeEntryModel.findOne({ user: userObjectId, endTime: null });
      if (active) {
        throw new BadRequestException('You already have an active timer');
      }

      const entry = new this.timeEntryModel({
        user: userObjectId,
        task: taskObjectId,
        startTime: new Date(),
      });
      return await entry.save();
    } catch (error) {
      this.logger.error(`Error in startTimer: ${error.message}`, error.stack);
      throw error;
    }
  }

  async stopTimer(userId: string) {
    try {
      if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid userId format');
      }
      const userObjectId = new Types.ObjectId(userId);

      const entry = await this.timeEntryModel.findOne({ user: userObjectId, endTime: null });
      if (!entry) {
        throw new BadRequestException('No active timer found');
      }

      entry.endTime = new Date();
      // Рассчитываем длительность в минутах
      const durationMs = entry.endTime.getTime() - entry.startTime.getTime();
      entry.durationMinutes = Math.floor(durationMs / 60000);

      await entry.save();
      return entry;
    } catch (error) {
      this.logger.error(`Error in stopTimer: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getByTask(taskId: string, userId: string) {
    if (!Types.ObjectId.isValid(taskId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid taskId or userId format');
    }
    return this.timeEntryModel.find({
      task: new Types.ObjectId(taskId),
      user: new Types.ObjectId(userId),
    }).exec();
  }

  async getActiveTimer(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId format');
    }
    return this.timeEntryModel.findOne({
      user: new Types.ObjectId(userId),
      endTime: null
    }).exec();
  }

  async getByUser(userId: string, startDate?: Date, endDate?: Date) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId format');
    }
    const filter: any = { user: new Types.ObjectId(userId) };
    if (startDate) filter.startTime = { $gte: startDate };
    if (endDate) filter.endTime = { $lte: endDate };
    return this.timeEntryModel.find(filter).populate('task').exec();
  }
}