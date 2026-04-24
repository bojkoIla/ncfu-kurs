import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Get()
  findAll(@Request() req, @Query() query: { project?: string; status?: string; priority?: string }) {
    return this.tasksService.findAll(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateData: Partial<CreateTaskDto>) {
    return this.tasksService.update(id, req.user.userId, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.tasksService.delete(id, req.user.userId);
  }
}