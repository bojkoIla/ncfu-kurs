import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) {}

  async create(userId: string, taskId: string, text: string) {
    const comment = new this.commentModel({
      author: new Types.ObjectId(userId),
      task: new Types.ObjectId(taskId),
      text,
    });
    const saved = await comment.save();
    return saved;
  }

  async findByTask(taskId: string) {
    const comments = await this.commentModel
      .find({ task: new Types.ObjectId(taskId) })
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .exec();

    return comments;
  }

  async delete(id: string, userId: string) {
    const comment = await this.commentModel.findOne({
      _id: id,
      author: new Types.ObjectId(userId),
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment.deleteOne();
  }
}