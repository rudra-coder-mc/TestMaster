// src/pages/tasks/create.tsx
import React from "react";
import { Card, Typography } from "antd";
import TaskForm from "../../components/Tasks/TaskForm";
import { useRouter } from "next/router";

const { Title } = Typography;

const CreateTaskPage: React.FC = () => {
  const router = useRouter();

  const handleSubmitSuccess = () => {
    router.push("/tasks");
  };

  return (
    <Card>
      <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
        Create New Task
      </Title>
      <TaskForm onSubmitSuccess={handleSubmitSuccess} />
    </Card>
  );
};

export default CreateTaskPage;
