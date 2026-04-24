import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TimeEntriesService } from './time-entries.service';

@Controller('time-entries')
@UseGuards(AuthGuard('jwt'))
export class TimeEntriesController {
  constructor(private timeEntriesService: TimeEntriesService) {}

  @Post('start')
  start(@Request() req, @Body('taskId') taskId: string) {
    return this.timeEntriesService.startTimer(req.user.userId, taskId);
  }

  @Post('stop')
  stop(@Request() req) {
    return this.timeEntriesService.stopTimer(req.user.userId);
  }

  @Get('active')
  async getActive(@Request() req) {
    const active = await this.timeEntriesService.getActiveTimer(req.user.userId);
    return active;
  }

  @Get('task/:taskId')
  getByTask(@Request() req, @Param('taskId') taskId: string) {
    return this.timeEntriesService.getByTask(taskId, req.user.userId);
  }
}