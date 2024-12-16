import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "@/components/Auth/SignupForm";
import { POST } from "@/utils/http";
import { message } from "antd";
import { useRouter } from "next/router";
import {
  AxiosError,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";

jest.mock("@/utils/http");
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("SignupForm", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }));
  });

  it("renders signup form with all required fields", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<SignupForm />);

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/please input/i)).toHaveLength(3);
    });
  });

  it("handles successful signup", async () => {
    (POST as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText(/username/i), "testuser");
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "password123");

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith("Signup successful!");
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("handles signup failure", async () => {
    const error = new AxiosError();
    error.response = {
      data: {
        success: false,
        message: "Email already exists",
        data: null,
      },
      status: 400,
      statusText: "Bad Request",
      headers: {} as AxiosRequestHeaders,
      config: {} as InternalAxiosRequestConfig,
    };

    (POST as jest.Mock).mockRejectedValueOnce(error);

    const user = userEvent.setup();
    render(<SignupForm />);

    // Fill in the form fields
    await act(async () => {
      await user.type(screen.getByLabelText(/username/i), "testuser");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/^password/i), "password123");
    });

    // Submit the form
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /sign up/i }));
    });

    // Wait for all updates to complete and check the error message
    await waitFor(() => {
      expect(POST).toHaveBeenCalledWith("/auth/register", {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });
      expect(message.error).toHaveBeenCalledWith("Email already exists");
    });
  });
});
