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
  Popconfirm,
  Card,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  ProjectOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { GET, POST, DELETE } from "../utils/http";
import { Task } from "@/types/task";
import { User } from "@/types/user";
import { getPriorityColor, getStatusColor } from "@/utils/color";
import { AxiosError } from "axios";

const { Option } = Select;
const { TextArea } = Input;

const AdminTaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState<boolean>(false);
  const [isAssignModalVisible, setIsAssignModalVisible] =
    useState<boolean>(false);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] =
    useState<Task | null>(null);
  const [form] = Form.useForm();

  // Memoized data fetching function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksResponse, usersResponse] = await Promise.all([
        GET<null, Task[]>("/tasks/all"),
        GET<null, User[]>("/users/all"),
      ]);

      if (tasksResponse.success) {
        setTasks(tasksResponse.data);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Centralized error handling
  const handleApiError = (action: string, error: AxiosError) => {
    console.error(`Failed to ${action}`, error);
    message.error(`Failed to ${action}`);
  };

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
        setTasks((prevTasks) => [...prevTasks, response.data]);
        setIsTaskModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      handleApiError("create task", error as AxiosError);
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
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === selectedTaskForAssignment._id ? response.data : task,
          ),
        );
        setIsAssignModalVisible(false);
      }
    } catch (error) {
      handleApiError("assign task", error as AxiosError);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await DELETE<null, null>(`/tasks/delete/${taskId}`);
      if (response.success) {
        message.success("Task deleted successfully");
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== taskId),
        );
      }
    } catch (error) {
      handleApiError("delete task", error as AxiosError);
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
      render: (status: Task["status"]) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: Task["priority"]) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
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
      render: (record: Task) => (
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
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {[
            {
              title: "Total Tasks",
              value: taskStats.total,
              icon: <ProjectOutlined />,
            },
            {
              title: "Completed Tasks",
              value: taskStats.completed,
              icon: <UserOutlined />,
            },
            {
              title: "In Progress Tasks",
              value: taskStats.inProgress,
              icon: <UserOutlined />,
            },
            {
              title: "Pending Tasks",
              value: taskStats.pending,
              icon: <UserOutlined />,
            },
          ].map((stat, index) => (
            <Col key={index} span={6}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsTaskModalVisible(true)}
          >
            Create Task
          </Button>
          <Button type="default" icon={<ReloadOutlined />} onClick={fetchData}>
            Refresh
          </Button>
        </div>

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
      </div>

      {/* Create/Edit Task Modal */}
      <Modal
        title="Create Task"
        open={isTaskModalVisible}
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
              {[
                "pending",
                "not-started",
                "in-progress",
                "completed",
                "cancelled",
                "on-hold",
              ].map((status) => (
                <Option key={status} value={status}>
                  {status
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Please select a priority!" }]}
          >
            <Select>
              {["low", "medium", "high"].map((priority) => (
                <Option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Option>
              ))}
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
        open={isAssignModalVisible}
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
