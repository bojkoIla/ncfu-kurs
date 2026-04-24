import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';

@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
  ) {
    const savedFile = await this.filesService.create(
      file,
      req.user.userId,
      projectId,
      taskId,
    );
    return {
      _id: savedFile._id,
      filename: savedFile.filename,
      originalName: savedFile.originalName,
      mimetype: savedFile.mimetype,
      size: savedFile.size,
      createdAt: (savedFile as any).createdAt,
    };
  }

  @Get('project/:projectId')
  async getProjectFiles(@Param('projectId') projectId: string) {
    const files = await this.filesService.findByProject(projectId);
    return files.map(f => ({
      _id: f._id,
      originalName: f.originalName,
      mimetype: f.mimetype,
      size: f.size,
      uploadedBy: (f.uploadedBy as any)?.username || 'Unknown',
      createdAt: (f as any).createdAt,
    }));
  }

  @Get('task/:taskId')
  async getTaskFiles(@Param('taskId') taskId: string) {
    const files = await this.filesService.findByTask(taskId);
    return files.map(f => ({
      _id: f._id,
      originalName: f.originalName,
      mimetype: f.mimetype,
      size: f.size,
      uploadedBy: (f.uploadedBy as any)?.username || 'Unknown',
      createdAt: (f as any).createdAt,
    }));
  }

  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.getFileInfo(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.download(file.path, file.originalName);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Request() req) {
    await this.filesService.delete(id, req.user.userId);
    return { message: 'File deleted' };
  }
}