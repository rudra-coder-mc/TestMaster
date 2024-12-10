import { Typography, Card } from "antd";
import TaskList from "../components/Tasks/TaskList";
import { HeaderContainer } from "@/components/styles";

const { Title } = Typography;

const TasksPage: React.FC = () => {
  return (
    <Card>
      <HeaderContainer>
        <Title level={2} style={{ margin: 0 }}>
          Tasks Management
        </Title>
      </HeaderContainer>

      <TaskList />
    </Card>
  );
};

export default TasksPage;
