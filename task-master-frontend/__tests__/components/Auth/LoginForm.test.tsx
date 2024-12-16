import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "@/components/Auth/LoginForm";
import { POST } from "@/utils/http";
import { message } from "antd";

// Mock the necessary dependencies
jest.mock("@/utils/http");
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form with all fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/please input your/i)).toHaveLength(2);
    });
  });

  it("handles successful login", async () => {
    (POST as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith("Login successful!");
    });
  });

  it("handles login failure", async () => {
    const error = new Error("Login failed");
    (POST as jest.Mock).mockRejectedValueOnce(error);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });
  });
});
