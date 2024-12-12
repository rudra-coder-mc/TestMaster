import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { TaskStatus } from '../task.schema';

@Injectable()
export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatuses = [
    'pending',
    'completed',
    'cancelled',
    'not-started',
    'in-progress',
    'on-hold',
  ];

  transform(value: any) {
    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`"${value}" is an invalid status`);
    }
    return value;
  }

  private isStatusValid(status: any): status is TaskStatus {
    return this.allowedStatuses.includes(status);
  }
}
