// src/pages/dashboard.tsx
import React from "react";
import { Row, Col, Card, Statistic, Typography } from "antd";
import {
  ProjectOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import TaskList from "@/components/Tasks/TaskList"; // Adjusted the import path to use an absolute alias

const { Title } = Typography;

const DashboardCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Dashboard: React.FC = () => {
  // Replace with real data fetched from the backend
  const dashboardStats = {
    totalTasks: 42,
    completedTasks: 23,
    inProgressTasks: 12,
    pendingTasks: 7,
  };

  return (
    <div>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <DashboardCard>
            <Statistic
              title="Total Tasks"
              value={dashboardStats.totalTasks}
              prefix={<ProjectOutlined />}
            />
          </DashboardCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashboardCard>
            <Statistic
              title="Completed Tasks"
              value={dashboardStats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </DashboardCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashboardCard>
            <Statistic
              title="In Progress Tasks"
              value={dashboardStats.inProgressTasks}
              prefix={<SyncOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </DashboardCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DashboardCard>
            <Statistic
              title="Pending Tasks"
              value={dashboardStats.pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </DashboardCard>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Title level={3}>Recent Tasks</Title>
        <TaskList />
      </div>
    </div>
  );
};

export default Dashboard;
