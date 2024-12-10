import { useState } from "react";
import { Form, Input, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { SocialButton } from "../styles";
import { POST } from "@/utils/http"; // Ensure this utility is defined
import { useRouter } from "next/router";
import { AxiosError } from "axios";
import { AxiosErrorResponse, SignupFormData } from "@/types/auth.type";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: SignupFormData) => {
    setLoading(true);
    try {
      // Send a POST request with form data
      await POST("/auth/register", values);
      message.success("Signup successful!");
      router.push("/login");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const axiosError = error as AxiosErrorResponse;
        console.error("Error:", axiosError);
        message.error(
          axiosError.response?.data?.message ||
            "Signup failed. Please try again.",
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
      name="signup"
      initialValues={{}}
      onFinish={onFinish}
      size="large"
      layout="vertical"
      autoComplete="off"
    >
      <Form.Item
        label="Username"
        name="username"
        rules={[
          { required: true, message: "Please input your username!" },
          { min: 3, message: "Username must be at least 3 characters!" },
        ]}
      >
        <Input
          prefix={<UserOutlined style={{ color: "#9CA3AF" }} />}
          placeholder="Enter your username"
        />
      </Form.Item>

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
          prefix={<MailOutlined style={{ color: "#9CA3AF" }} />}
          placeholder="Enter your email"
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
          Sign up
        </SocialButton>
      </Form.Item>
    </Form>
  );
}
