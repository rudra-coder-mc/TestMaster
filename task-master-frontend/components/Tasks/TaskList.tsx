import React, { useState, useEffect } from "react";
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
  Avatar,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import moment from "moment";
import Cookies from "js-cookie"; // For cookie management
import { GET, POST, PUT, DELETE } from "../../utils/http"; // Adjust the import path

const { Option } = Select;
const { TextArea } = Input;

interface User {
  _id: string;
  name: string;
  email: string;
}

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

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [filters, setFilters] = useState<{
    status: string | undefined;
    priority: string | undefined;
    dueDate: string | undefined;
  }>({
    status: undefined,
    priority: undefined,
    dueDate: undefined,
  });

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  // Retrieve user info from cookies
  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        // Remove the 'j:' prefix, if it exists
        const cleanedUserCookie = userCookie.startsWith("j:")
          ? userCookie.slice(2)
          : userCookie;

        const user = JSON.parse(cleanedUserCookie);
        setUserId(user._id);
        setUserRole(user.role);
      } catch (error) {
        console.error("Invalid JSON in user cookie:", error);
      }
    } else {
      console.warn("No user cookie found.");
    }
  }, []);

  // Fetch tasks for the logged-in user with filters
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        // Build filter query params dynamically
        const filterParams = Object.fromEntries(
          Object.entries({
            assignedTo: userId,
            status: filters.status,
            priority: filters.priority,
            dueDate: filters.dueDate,
          }).filter(([_, value]) => value !== undefined), // Remove undefined values
        ) as Record<string, string>;

        // Make GET request with query parameters
        const queryString = new URLSearchParams(filterParams).toString();

        // Make GET request with query parameters
        const tasksResponse = await GET<null, Task[]>(
          `/tasks/filter/user/${userId}?${queryString}`,
        );

        if (tasksResponse.success) {
          setTasks(tasksResponse.data);
          if (tasksResponse.message) {
            message.info(tasksResponse.message);
          }
        } else {
          message.error("Failed to fetch tasks");
        }
      } catch (error: any) {
        message.error(error.response?.data?.message || "Error fetching tasks");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [userId, filters]); // Fetch tasks when userId or filters change
  // Handle task deletion
  const handleDelete = async (taskId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this task?",
      content: "This action cannot be undone.",
      onOk: async () => {
        try {
          const response = await DELETE<null, null>(`/tasks/delete/${taskId}`);
          if (response.success) {
            message.success("Task deleted successfully");
            setTasks(tasks.filter((task) => task._id !== taskId));
          } else {
            message.error("Failed to delete task");
          }
        } catch (error) {
          message.error("Error deleting task");
        }
      },
    });
  };

  // Open modal for editing task
  const showTaskModal = (task?: Task) => {
    if (task) {
      setIsEditMode(true);
      setCurrentTask(task);
      form.setFieldsValue({
        ...task,
        dueDate: task.dueDate ? moment(task.dueDate) : undefined,
      });
    } else {
      setIsEditMode(false);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // Handle form submission for updating task
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };

      const response = await PUT<Partial<Task>, null>(
        `/tasks/update/${currentTask._id}`,
        payload,
      );

      if (response.success) {
        message.success("Task updated successfully");
        setTasks((prev) =>
          prev.map((task) =>
            task._id === currentTask._id ? { ...task, ...values } : task,
          ),
        );
      } else {
        message.error("Failed to update task");
      }

      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to save task");
    }
  };

  // Columns for the task table
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => description || "No description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Task["status"]) => {
        const colorMap: Record<Task["status"], string> = {
          pending: "orange",
          "not-started": "gray",
          "in-progress": "blue",
          completed: "green",
          cancelled: "red",
          "on-hold": "purple",
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: Task["priority"]) => {
        const colorMap: Record<Task["priority"], string> = {
          low: "green",
          medium: "orange",
          high: "red",
        };
        return <Tag color={colorMap[priority]}>{priority.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: Date) =>
        date ? moment(date).format("MMMM D, YYYY") : "No due date",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: string, record: Task) =>
        record.assignedTo.includes(userId || "") && (
          <Space size="middle">
            <Button
              icon={<EditOutlined />}
              onClick={() => showTaskModal(record)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
              danger
            />
          </Space>
        ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filter by Status"
          style={{ width: 200 }}
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value }))
          }
        >
          <Option value="pending">Pending</Option>
          <Option value="not-started">Not Started</Option>
          <Option value="in-progress">In Progress</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
          <Option value="on-hold">On Hold</Option>
        </Select>
        <Select
          placeholder="Filter by Priority"
          style={{ width: 200 }}
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, priority: value }))
          }
        >
          <Option value="low">Low</Option>
          <Option value="medium">Medium</Option>
          <Option value="high">High</Option>
        </Select>
        <DatePicker
          placeholder="Filter by Due Date"
          style={{ width: 200 }}
          onChange={(date) =>
            setFilters((prev) => ({
              ...prev,
              dueDate: date?.toISOString() || undefined,
            }))
          }
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

      {/* Modal for editing task */}
      <Modal
        title={isEditMode ? "Edit Task" : "Create Task"}
        visible={isModalVisible}
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
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select a status!" }]}
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="not-started">Not Started</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="on-hold">On Hold</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Please select a priority!" }]}
          >
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
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
