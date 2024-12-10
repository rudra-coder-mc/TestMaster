// src/components/Tasks/TaskFilterBar.tsx
import React from "react";
import { Col, Select, Input, Button } from "antd";
import { FilterContainer } from "../styles";
import { TaskFilterProps } from "@/types/task";

const { Option } = Select;
const { Search } = Input;

const TaskFilterBar: React.FC<TaskFilterProps> = ({ onFilter }) => {
  const handleStatusChange = (status: string) => {
    onFilter({ status });
  };

  const handleSearch = (value: string) => {
    onFilter({ search: value });
  };

  const handleReset = () => {
    onFilter({});
  };

  return (
    <FilterContainer gutter={16} align="middle">
      <Col xs={24} sm={8}>
        <Select
          placeholder="Filter by Status"
          style={{ width: "100%" }}
          onChange={handleStatusChange}
          allowClear
        >
          <Option value="TODO">To Do</Option>
          <Option value="IN_PROGRESS">In Progress</Option>
          <Option value="DONE">Done</Option>
        </Select>
      </Col>
      <Col xs={24} sm={8}>
        <Search
          placeholder="Search tasks"
          onSearch={handleSearch}
          enterButton
        />
      </Col>
      <Col xs={24} sm={8}>
        <Button onClick={handleReset}>Reset Filters</Button>
      </Col>
    </FilterContainer>
  );
};

export default TaskFilterBar;
