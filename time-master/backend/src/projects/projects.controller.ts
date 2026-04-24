import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@Request() req, @Body() body) {
    return this.projectsService.create(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAllByOwner(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.projectsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body) {
    return this.projectsService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.projectsService.delete(id, req.user.userId);
  }
}