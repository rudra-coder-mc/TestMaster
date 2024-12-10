import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Select,
  DatePicker,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import { DELETE, GET, PUT } from "@/utils/http";
import { AxiosErrorResponse } from "@/types/auth.type";
import useUserAuth from "@/hooks/useUserAuth";

// Constants with Improved Type Safety
const TASK_STATUSES = {
  PENDING: "pending",
  NOT_STARTED: "not-started",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ON_HOLD: "on-hold",
} as const;

const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

// Type-safe Color Mapping
const STATUS_COLOR_MAP: Record<keyof typeof TASK_STATUSES, string> = {
  PENDING: "orange",
  NOT_STARTED: "gray",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  ON_HOLD: "purple",
};

const PRIORITY_COLOR_MAP: Record<keyof typeof TASK_PRIORITIES, string> = {
  LOW: "green",
  MEDIUM: "orange",
  HIGH: "red",
};

// Types
type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];
type TaskPriority = (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES];

type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignedTo: string[];
};

// Refined type guard for AxiosErrorResponse
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorResponse => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response: unknown }).response === "object" &&
    "data" in (error as { response: { data: unknown } }).response &&
    typeof (error as { response: { data: unknown } }).response.data ===
      "object" &&
    "message" in
      (error as { response: { data: { message: string } } }).response.data
  );
};

// Updated error handler using the type-safe guard
const handleApiError = (error: unknown, defaultMessage: string) => {
  console.error(error);

  // Check if the error is of type AxiosErrorResponse
  if (isAxiosErrorResponse(error)) {
    // Use optional chaining to avoid accessing properties of 'undefined'
    const errorMessage = error.response?.data?.message || defaultMessage;

    // Ensure message.error gets a string
    message.error(
      typeof errorMessage === "string" ? errorMessage : defaultMessage,
    );
  } else {
    // If error doesn't match the expected structure, show the default message
    message.error(defaultMessage);
  }
};

// API Service
const taskService = {
  async fetchTasks(userId: string, filters: Record<string, string>) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await GET<null, Task[]>(
        `/tasks/filter/user/${userId}?${queryString}`,
      );

      if (!response.success || !response.data) {
        throw new Error("Failed to fetch tasks");
      }
      return response.data;
    } catch (error) {
      handleApiError(error, "Error fetching tasks");
      return [];
    }
  },

  async updateTask(taskId: string, payload: Partial<Task>) {
    try {
      const response = await PUT(`/tasks/update/${taskId}`, payload);

      if (!response.success) {
        throw new Error("Failed to update task");
      }

      return true;
    } catch (error) {
      handleApiError(error, "Failed to save task");
      return false;
    }
  },

  async deleteTask(taskId: string) {
    try {
      const response = await DELETE(`/tasks/delete/${taskId}`);

      if (!response.success) {
        throw new Error("Failed to delete task");
      }

      return true;
    } catch (error) {
      handleApiError(error, "Error deleting task");
      return false;
    }
  },
};

// Main Component
const TaskList: React.FC = () => {
  const { userId } = useUserAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [form] = Form.useForm();

  // Columns definition (memoization removed, simplified)
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (description: string) => description || "No description",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: TaskStatus) => (
        <Tag
          color={
            STATUS_COLOR_MAP[status.toUpperCase() as keyof typeof TASK_STATUSES]
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (priority: TaskPriority) => (
        <Tag
          color={
            PRIORITY_COLOR_MAP[
              priority.toUpperCase() as keyof typeof TASK_PRIORITIES
            ]
          }
        >
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (date: Date) =>
        date ? moment(date).format("MMMM D, YYYY") : "No due date",
    },
    {
      title: "Actions",
      render: (record: Task) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditTask(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTask(record._id)}
            danger
          />
        </Space>
      ),
    },
  ];

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    const filteredTasks = await taskService.fetchTasks(userId, {
      ...filters,
      assignedTo: userId,
    });

    setTasks(filteredTasks);
    setLoading(false);
  }, [userId, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Task Handlers
  const handleEditTask = (task?: Task) => {
    setCurrentTask(task || {});
    form.setFieldsValue({
      ...task,
      dueDate: task?.dueDate ? moment(task.dueDate) : undefined,
    });
    setIsModalVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this task?",
      content: "This action cannot be undone.",
      onOk: async () => {
        const success = await taskService.deleteTask(taskId);
        if (success) {
          setTasks(tasks.filter((task) => task._id !== taskId));
          message.success("Task deleted successfully");
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };

      const success = await taskService.updateTask(currentTask._id!, payload);

      if (success) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === currentTask._id ? { ...task, ...values } : task,
          ),
        );
        setIsModalVisible(false);
        message.success("Task updated successfully");
      }
    } catch (error) {
      handleApiError(error, "Failed to save task");
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={fetchTasks} type="primary">
          Refresh
        </Button>
        <Select
          placeholder="Filter by Status"
          style={{ width: 200 }}
          allowClear
          onChange={(value) => {
            setFilters((prev) => {
              const updatedFilters = { ...prev };
              if (value) {
                updatedFilters.status = value;
              } else {
                delete updatedFilters.status;
              }
              return updatedFilters;
            });
          }}
        >
          {Object.values(TASK_STATUSES).map((status) => (
            <Select.Option key={status} value={status}>
              {status.replace("-", " ").toUpperCase()}
            </Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Filter by Priority"
          style={{ width: 200 }}
          allowClear
          onChange={(value) => {
            setFilters((prev) => {
              const updatedFilters = { ...prev };
              if (value) {
                updatedFilters.priority = value;
              } else {
                delete updatedFilters.priority;
              }
              return updatedFilters;
            });
          }}
        >
          {Object.values(TASK_PRIORITIES).map((priority) => (
            <Select.Option key={priority} value={priority}>
              {priority.toUpperCase()}
            </Select.Option>
          ))}
        </Select>
        <DatePicker
          placeholder="Filter by Due Date"
          style={{ width: 200 }}
          onChange={(date) => {
            setFilters((prev) => {
              const updatedFilters = { ...prev };
              if (date) {
                updatedFilters.dueDate = date.toISOString();
              } else {
                delete updatedFilters.dueDate;
              }
              return updatedFilters;
            });
          }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="_id"
        pagination={{
          total: tasks.length,
          pageSize: 10,
          showSizeChanger: true,
        }}
      />

      <Modal
        title="Edit Task"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Please enter the task title!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select a status!" }]}
          >
            <Select>
              {Object.values(TASK_STATUSES).map((status) => (
                <Select.Option key={status} value={status}>
                  {status.replace("-", " ").toUpperCase()}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Please select a priority!" }]}
          >
            <Select>
              {Object.values(TASK_PRIORITIES).map((priority) => (
                <Select.Option key={priority} value={priority}>
                  {priority.toUpperCase()}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default TaskList;
