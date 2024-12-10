import React, { useState, useEffect } from "react";
import { Button, Typography, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TaskList from "../../components/Tasks/TaskList";
import TaskForm from "../../components/Tasks/TaskForm";
import Cookies from "js-cookie"; // Importing js-cookie to manage cookies

const { Title } = Typography;

const TasksPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  // Fetch user and role from cookies
  useEffect(() => {
    const userCookie = Cookies.get("user"); // Get the user object from cookies
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie); // Parse the JSON string
        setUserRole(user.role); // Extract and set the role
      } catch (error) {
        console.error("Failed to parse user cookie", error);
      }
    }
  }, []);

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Tasks Management
        </Title>
        {/* Render "Create Task" button only for admins */}
        {userRole === "admin" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Create Task
          </Button>
        )}
      </div>

      <TaskList />

      {/* Render Task Form Modal only if isModalVisible is true */}
      {isModalVisible && (
        <TaskForm onSubmitSuccess={() => setIsModalVisible(false)} />
      )}
    </Card>
  );
};

export default TasksPage;
