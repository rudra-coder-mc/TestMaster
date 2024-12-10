import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: 'user' })
  type: 'admin' | 'user';
}

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export const UserSchema = SchemaFactory.createForClass(User);
