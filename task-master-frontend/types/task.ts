// src/types/task.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
