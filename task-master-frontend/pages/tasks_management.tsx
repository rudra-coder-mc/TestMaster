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
  Popconfirm,
  Transfer,
  Card,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import moment from "moment";
import Cookies from "js-cookie";
import { GET, POST, PUT, DELETE } from "../utils/http";

const { Option } = Select;
const { TextArea } = Input;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
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

const AdminTaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState<boolean>(false);
  const [isAssignModalVisible, setIsAssignModalVisible] =
    useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] =
    useState<Task | null>(null);
  const [form] = Form.useForm();

  // Fetch all tasks and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tasks
        const tasksResponse = await GET<null, Task[]>("/tasks/all");
        if (tasksResponse.success) {
          setTasks(tasksResponse.data);
        }

        // Fetch users
        const usersResponse = await GET<null, User[]>("/users/all");
        if (usersResponse.success) {
          setUsers(usersResponse.data);
          console.log(usersResponse.data);
        }
      } catch (error) {
        message.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create a new task
  const handleCreateTask = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };

      const response = await POST<Partial<Task>, Task>(
        "/tasks/create",
        payload,
      );

      if (response.success) {
        message.success("Task created successfully");
        setTasks([...tasks, response.data]);
        setIsTaskModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      message.error("Failed to create task");
    }
  };

  // Assign users to a task
  const handleAssignTask = async (selectedUserIds: string[]) => {
    if (!selectedTaskForAssignment) return;

    try {
      const response = await POST<{ taskId: string; userIds: string[] }, Task>(
        "/tasks/assign",
        {
          taskId: selectedTaskForAssignment._id,
          userIds: selectedUserIds,
        },
      );

      if (response.success) {
        message.success("Task assigned successfully");
        setTasks(
          tasks.map((task) =>
            task._id === selectedTaskForAssignment._id ? response.data : task,
          ),
        );
        setIsAssignModalVisible(false);
      }
    } catch (error) {
      message.error("Failed to assign task");
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await DELETE<null, null>(`/tasks/delete/${taskId}`);
      if (response.success) {
        message.success("Task deleted successfully");
        setTasks(tasks.filter((task) => task._id !== taskId));
      }
    } catch (error) {
      message.error("Failed to delete task");
    }
  };

  // Task table columns
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
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (assignedUserIds: string[]) => {
        const assignedUsers = users.filter((user) =>
          assignedUserIds.includes(user._id),
        );
        return (
          assignedUsers.map((user) => user.name).join(", ") || "Unassigned"
        );
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
      render: (text: string, record: Task) => (
        <Space size="middle">
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedTaskForAssignment(record);
              setIsAssignModalVisible(true);
            }}
          >
            Assign
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => handleDeleteTask(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "completed").length,
    inProgress: tasks.filter((task) => task.status === "in-progress").length,
    pending: tasks.filter((task) => task.status === "pending").length,
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={taskStats.total}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={taskStats.completed}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress Tasks"
              value={taskStats.inProgress}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={taskStats.pending}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsTaskModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Create Task
      </Button>

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

      {/* Create/Edit Task Modal */}
      <Modal
        title="Create Task"
        visible={isTaskModalVisible}
        onOk={handleCreateTask}
        onCancel={() => {
          setIsTaskModalVisible(false);
          form.resetFields();
        }}
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

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        visible={isAssignModalVisible}
        onOk={() => {
          const selectedUserIds = form.getFieldValue("assignedTo") || [];
          handleAssignTask(selectedUserIds);
        }}
        onCancel={() => {
          setIsAssignModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="assignedTo"
            label="Assign Users"
            rules={[{ required: true, message: "Please select users!" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select users to assign"
              style={{ width: "100%" }}
            >
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTaskDashboard;
