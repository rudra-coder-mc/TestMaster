export interface TaskFilter {
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date | { $gte: Date; $lte: Date };
  assignedTo?: string;
}
