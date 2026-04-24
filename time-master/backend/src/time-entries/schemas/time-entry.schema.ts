import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class TimeEntry {
  @Prop({ type: Types.ObjectId, ref: 'Task', required: true })
  task: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop({ default: 0 })
  durationMinutes: number;
}

export const TimeEntrySchema = SchemaFactory.createForClass(TimeEntry);