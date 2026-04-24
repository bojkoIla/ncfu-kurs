import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TimeEntry, TimeEntrySchema } from '../time-entries/schemas/time-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeEntry.name, schema: TimeEntrySchema }]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}