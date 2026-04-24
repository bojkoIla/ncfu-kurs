import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('by-projects')
  async getByProjects(@Request() req, @Query('start') start: string, @Query('end') end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return this.reportsService.getTimeByProjects(req.user.userId, startDate, endDate);
  }

  @Get('daily')
  async getDaily(@Request() req, @Query('date') date: string) {
    const targetDate = new Date(date);
    return this.reportsService.getDailyReport(req.user.userId, targetDate);
  }
}