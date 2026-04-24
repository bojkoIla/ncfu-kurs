import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' })
  status: TaskStatus;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: TaskPriority;

  @Prop()
  dueDate: Date;

  @Prop({ default: 0 })
  estimatedHours: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);