import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskList from "@/components/Tasks/TaskList";
import { GET, DELETE } from "@/utils/http";
import { message } from "antd";

jest.mock("@/utils/http");
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockTasks = [
  {
    _id: "1",
    title: "Test Task 1",
    description: "Description 1",
    status: "in-progress",
    priority: "high",
    dueDate: new Date("2024-03-20"),
    assignedTo: ["user1"],
  },
  {
    _id: "2",
    title: "Test Task 2",
    description: "Description 2",
    status: "completed",
    priority: "low",
    dueDate: new Date("2024-03-21"),
    assignedTo: ["user2"],
  },
];

describe("TaskList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (GET as jest.Mock).mockResolvedValue({ data: mockTasks });
  });

  it("renders task list with loading state", async () => {
    render(<TaskList />);

    expect(screen.getByTestId("tasks-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("tasks-loading")).not.toBeInTheDocument();
    });
  });

  it("displays tasks with correct information", async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      expect(screen.getByText("Test Task 2")).toBeInTheDocument();
    });

    const firstTask = screen.getByText("Test Task 1").closest("tr");
    expect(within(firstTask!).getByText("in-progress")).toBeInTheDocument();
    expect(within(firstTask!).getByText("high")).toBeInTheDocument();
  });

  it("handles task deletion", async () => {
    (DELETE as jest.Mock).mockResolvedValueOnce({ success: true });
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
    await userEvent.click(deleteButton);

    // Confirm deletion in modal
    const confirmButton = screen.getByRole("button", { name: /ok/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(message.success).toHaveBeenCalledWith("Task deleted successfully");
      expect(DELETE).toHaveBeenCalledWith("/tasks/1");
    });
  });

  it("handles task deletion error", async () => {
    (DELETE as jest.Mock).mockRejectedValueOnce(new Error("Delete failed"));
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[0];
    await userEvent.click(deleteButton);

    const confirmButton = screen.getByRole("button", { name: /ok/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });
  });

  it("handles task filtering", async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(3); // Including header row
    });

    const filterInput = screen.getByPlaceholderText(/search tasks/i);
    await userEvent.type(filterInput, "Task 1");

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(2); // Header + 1 filtered row
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Task 2")).not.toBeInTheDocument();
    });
  });

  it("handles task sorting", async () => {
    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument();
    });

    const titleHeader = screen.getByRole("columnheader", { name: /title/i });
    await userEvent.click(titleHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(within(rows[1]).getByText("Test Task 1")).toBeInTheDocument();
      expect(within(rows[2]).getByText("Test Task 2")).toBeInTheDocument();
    });

    // Click again to reverse sort
    await userEvent.click(titleHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(within(rows[1]).getByText("Test Task 2")).toBeInTheDocument();
      expect(within(rows[2]).getByText("Test Task 1")).toBeInTheDocument();
    });
  });
});
