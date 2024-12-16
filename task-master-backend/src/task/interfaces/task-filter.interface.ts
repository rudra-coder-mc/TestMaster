export interface TaskFilter {
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
}
