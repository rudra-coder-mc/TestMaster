import { Task } from "@/types/task";

const getPriorityColor = (priority: Task["priority"]): string => {
  const colorMap: Record<Task["priority"], string> = {
    low: "green",
    medium: "orange",
    high: "red",
  };
  return colorMap[priority];
};

// Utility function to map status and priority to colors
const getStatusColor = (status: Task["status"]): string => {
  const colorMap: Record<Task["status"], string> = {
    pending: "orange",
    "not-started": "gray",
    "in-progress": "blue",
    completed: "green",
    cancelled: "red",
    "on-hold": "purple",
  };
  return colorMap[status];
};

export { getPriorityColor, getStatusColor };
