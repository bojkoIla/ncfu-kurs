import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Note {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const NoteSchema = SchemaFactory.createForClass(Note);