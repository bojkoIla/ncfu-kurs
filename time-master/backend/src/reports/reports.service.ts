import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TimeEntry } from '../time-entries/schemas/time-entry.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(TimeEntry.name) private timeEntryModel: Model<TimeEntry>,
  ) {}

  async getTimeByProjects(userId: string, startDate: Date, endDate: Date) {
    const result = await this.timeEntryModel.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          startTime: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'task',
          foreignField: '_id',
          as: 'taskInfo',
        },
      },
      { $unwind: '$taskInfo' },
      {
        $lookup: {
          from: 'projects',
          localField: 'taskInfo.project',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: '$projectInfo' },
      {
        $group: {
          _id: '$projectInfo._id',
          projectName: { $first: '$projectInfo.name' },
          totalMinutes: { $sum: '$durationMinutes' },
        },
      },
    ]);
    return result;
  }

  async getDailyReport(userId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.timeEntryModel.find({
      user: new Types.ObjectId(userId),
      startTime: { $gte: start, $lte: end },
    }).populate('task').exec();
  }
}