import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

  async create(userId: string, data: { title: string; content?: string; tags?: string[] }) {
    const note = new this.noteModel({
      ...data,
      user: new Types.ObjectId(userId),
    });
    return note.save();
  }

  async findAll(userId: string) {
    return this.noteModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ isPinned: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string) {
    const note = await this.noteModel.findOne({
      _id: id,
      user: new Types.ObjectId(userId),
    }).exec();
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async update(id: string, userId: string, data: Partial<Note>) {
    const note = await this.noteModel.findOneAndUpdate(
      { _id: id, user: new Types.ObjectId(userId) },
      data,
      { new: true },
    ).exec();
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async delete(id: string, userId: string) {
    const result = await this.noteModel.deleteOne({
      _id: id,
      user: new Types.ObjectId(userId),
    }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Note not found');
    return { message: 'Note deleted' };
  }

  async togglePin(id: string, userId: string) {
    const note = await this.findOne(id, userId);
    note.isPinned = !note.isPinned;
    return note.save();
  }
}