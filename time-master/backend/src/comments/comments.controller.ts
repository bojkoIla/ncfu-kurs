import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  async create(@Request() req, @Body() body: { taskId: string; text: string }) {
    const comment = await this.commentsService.create(
      req.user.userId,
      body.taskId,
      body.text,
    );
    return {
      _id: comment._id,
      text: comment.text,
      author: comment.author,
      task: comment.task,
      createdAt: comment['createdAt'],
    };
  }

  @Get('task/:taskId')
  async findByTask(@Param('taskId') taskId: string) {
    const comments = await this.commentsService.findByTask(taskId);
    // Преобразуем для фронтенда
    return comments.map(comment => ({
      _id: comment._id,
      text: comment.text,
      author: comment.author['_id'],
      authorName: comment.author['username'],
      task: comment.task,
      createdAt: comment['createdAt'],
    }));
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    await this.commentsService.delete(id, req.user.userId);
    return { message: 'Comment deleted' };
  }
}