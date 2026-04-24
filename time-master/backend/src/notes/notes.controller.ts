import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotesService } from './notes.service';

@Controller('notes')
@UseGuards(AuthGuard('jwt'))
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  create(@Request() req, @Body() body: { title: string; content?: string; tags?: string[] }) {
    return this.notesService.create(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req) {
    return this.notesService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.notesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Request() req, @Body() body: Partial<{ title: string; content: string; tags: string[] }>) {
    return this.notesService.update(id, req.user.userId, body);
  }

  @Put(':id/pin')
  togglePin(@Param('id') id: string, @Request() req) {
    return this.notesService.togglePin(id, req.user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.notesService.delete(id, req.user.userId);
  }
}