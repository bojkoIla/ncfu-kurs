import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  async create(ownerId: string, data: { name: string; description?: string; color?: string }) {
    const project = new this.projectModel({ ...data, owner: new Types.ObjectId(ownerId) });
    return project.save();
  }

  async findAllByOwner(ownerId: string) {
    return this.projectModel.find({ owner: new Types.ObjectId(ownerId) }).exec();
  }

  async findOne(id: string, ownerId: string) {
    return this.projectModel.findOne({ _id: id, owner: new Types.ObjectId(ownerId) }).exec();
  }

  async update(id: string, ownerId: string, data: Partial<Project>) {
    return this.projectModel.findOneAndUpdate(
      { _id: id, owner: new Types.ObjectId(ownerId) },
      data,
      { new: true },
    ).exec();
  }

  async delete(id: string, ownerId: string) {
    return this.projectModel.findOneAndDelete({ _id: id, owner: new Types.ObjectId(ownerId) }).exec();
  }
}