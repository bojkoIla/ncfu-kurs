import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { TimeEntriesController } from './time-entries.controller';
import { TimeEntriesService } from './time-entries.service';
import { TimeEntry, TimeEntrySchema } from './schemas/time-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeEntry.name, schema: TimeEntrySchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService],
  exports: [TimeEntriesService],
})
export class TimeEntriesModule {}