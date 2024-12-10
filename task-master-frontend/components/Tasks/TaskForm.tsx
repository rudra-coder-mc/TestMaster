// src/components/Tasks/TaskForm.tsx
import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { POST, PUT } from "../../utils/http";
import { Task, TaskFormProps } from "@/types/task"; // Ensure this is the correct import
import { StyledForm } from "../styles";
import { AxiosError } from "axios";

const { TextArea } = Input;

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmitSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description || "", // Ensure description is defaulted to empty string if undefined
        status: task.status,
        assignedTo: task.assignedTo || "", // Ensure assignedTo is optional
      });
    }
  }, [task, form]);

  const handleSubmit = async (values: unknown) => {
    const taskValues = values as Task; // Cast to Task
    setLoading(true);
    try {
      if (task) {
        // Update existing task
        const response = await PUT(`/tasks/${task._id}`, taskValues);
        if (response.success) {
          message.success("Task updated successfully");
        } else {
          throw new Error(response.message || "Failed to update task");
        }
      } else {
        // Create new task
        const response = await POST("/tasks/create", taskValues);
        if (response.success) {
          message.success("Task created successfully");
          form.resetFields();
        } else {
          throw new Error(response.message || "Failed to create task");
        }
      }
      onSubmitSuccess?.();
    } catch (error: unknown) {
      const errors = error instanceof AxiosError;
      console.error(error, errors);
      const errorMsg = errors || "An unexpected error occurred";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledForm form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="title"
        label="Task Title"
        rules={[
          {
            required: true,
            message: "Please enter the task title.",
          },
        ]}
      >
        <Input placeholder="Enter task title" />
      </Form.Item>

      <Form.Item name="description" label="Task Description">
        <TextArea rows={4} placeholder="Optional task description" />
      </Form.Item>

      <Form.Item
        name="status"
        label="Task Status"
        initialValue="TODO"
        rules={[
          {
            required: true,
            message: "Please select a task status.",
          },
        ]}
      >
        <Select placeholder="Select task status">
          <Select.Option value="TODO">To Do</Select.Option>
          <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
          <Select.Option value="DONE">Done</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="assignedTo" label="Assigned To">
        <Input placeholder="Enter assignee name" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {task ? "Update Task" : "Create Task"}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

export default TaskForm;
