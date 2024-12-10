import { useState } from "react";
import { Form, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { SocialButton } from "../styles"; // Styled component for the button
import { POST } from "@/utils/http"; // Make sure this utility is properly defined
import { useRouter } from "next/router";
import { AxiosError } from "axios";
import { AxiosErrorResponse, LoginFormData } from "@/types/auth.type";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // Send a POST request with form data
      await POST("/auth/login", values);
      message.success("Login successful!");
      router.push("/tasks");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosErrorResponse;
        console.error("Error:", axiosError);
        message.error(
          axiosError.response?.data?.message ||
            "Login failed. Please try again.",
        );
      } else {
        message.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      size="large"
      layout="vertical"
      autoComplete="off"
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please input your email!" },
          {
            type: "email",
            message: "Please enter a valid email address!",
          },
        ]}
      >
        <Input
          prefix={<UserOutlined style={{ color: "#9CA3AF" }} />}
          placeholder="Enter your email"
          autoFocus
        />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          { required: true, message: "Please input your password!" },
          {
            min: 6,
            message: "Password must be at least 6 characters!",
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#9CA3AF" }} />}
          placeholder="Enter your password"
        />
      </Form.Item>

      <Form.Item>
        <SocialButton htmlType="submit" type="default" loading={loading}>
          Sign in
        </SocialButton>
      </Form.Item>
    </Form>
  );
}
