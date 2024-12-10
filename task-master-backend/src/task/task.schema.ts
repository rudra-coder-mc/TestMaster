import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  dueDate: Date;

  // Modified assignedTo to be an array of ObjectIds referencing User
  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'User' }] })
  assignedTo: mongoose.Types.ObjectId[]; // This will store an array of User IDs

  @Prop({ required: true })
  priority: 'low' | 'medium' | 'high';

  @Prop({ required: true })
  status:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'not-started'
    | 'in-progress'
    | 'on-hold';
}

export const TaskSchema = SchemaFactory.createForClass(Task);

export type TaskStatus =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'not-started'
  | 'in-progress'
  | 'on-hold';
