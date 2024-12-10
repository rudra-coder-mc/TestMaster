// src/types/task.ts
interface Task {
  _id: string;
  title: string;
  description: string;
  status:
    | "pending"
    | "completed"
    | "cancelled"
    | "not-started"
    | "in-progress"
    | "on-hold";
  priority: "low" | "medium" | "high";
  dueDate: Date;
  assignedTo: string[];
}

interface TaskFilterProps {
  onFilter: (filters: {
    status?: string;
    search?: string;
    assignedTo?: string;
  }) => void;
}

interface TaskFormProps {
  task?: Task;
  onSubmitSuccess?: () => void;
}
export type { TaskFilterProps, Task, TaskFormProps };
