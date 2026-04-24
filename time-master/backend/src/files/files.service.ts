import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { File } from './schemas/file.schema';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  async create(
    file: Express.Multer.File,
    userId: string,
    projectId?: string,
    taskId?: string,
  ) {
    const fileDoc = new this.fileModel({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: new Types.ObjectId(userId),
      project: projectId ? new Types.ObjectId(projectId) : undefined,
      task: taskId ? new Types.ObjectId(taskId) : undefined,
    });
    const saved = await fileDoc.save();
    return saved;
  }

  async findByProject(projectId: string) {
    const files = await this.fileModel
      .find({ project: new Types.ObjectId(projectId) })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .exec();

    return files;
  }

  async findByTask(taskId: string) {
    const files = await this.fileModel
      .find({ task: new Types.ObjectId(taskId) })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .exec();

    return files;
  }

  async delete(id: string, userId: string) {
    const file = await this.fileModel.findOne({
      _id: id,
      uploadedBy: new Types.ObjectId(userId),
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Удаляем физический файл
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return file.deleteOne();
  }

  async getFileInfo(id: string) {
    return this.fileModel.findById(id).exec();
  }
}