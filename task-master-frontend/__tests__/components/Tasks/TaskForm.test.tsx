import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskForm from "@/components/Tasks/TaskForm";
import { POST } from "@/utils/http";
import { message } from "antd";

jest.mock("@/utils/http");
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("TaskForm", () => {
  const mockOnSubmitSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(<TaskForm onSubmitSuccess={mockOnSubmitSuccess} />);

    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/task description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/task status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument();
  });

  it("handles successful task creation", async () => {
    (POST as jest.Mock).mockResolvedValueOnce({ success: true });
    render(<TaskForm onSubmitSuccess={mockOnSubmitSuccess} />);

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "New Task" },
    });
    fireEvent.change(screen.getByLabelText(/task status/i), {
      target: { value: "TODO" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create task/i }));

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith("Task created successfully");
      expect(mockOnSubmitSuccess).toHaveBeenCalled();
    });
  });

  it("handles task creation failure", async () => {
    const error = new Error("Failed to create task");
    (POST as jest.Mock).mockRejectedValueOnce(error);

    render(<TaskForm onSubmitSuccess={mockOnSubmitSuccess} />);

    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "New Task" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create task/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
      expect(mockOnSubmitSuccess).not.toHaveBeenCalled();
    });
  });
});
