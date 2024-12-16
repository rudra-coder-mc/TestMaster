import { render, screen, waitFor } from "@testing-library/react";
import TaskFilterBar from "@/components/Tasks/TaskFilterBar";
import userEvent from "@testing-library/user-event";

describe("TaskFilterBar", () => {
  const mockOnFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all filter components with correct placeholders", () => {
    render(<TaskFilterBar onFilter={mockOnFilter} />);

    expect(screen.getByPlaceholderText("Filter by Status")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search tasks")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  describe("Status Filter", () => {
    it("calls onFilter with correct status when status changes", async () => {
      render(<TaskFilterBar onFilter={mockOnFilter} />);
      const statusFilter = screen.getByPlaceholderText("Filter by Status");

      await userEvent.click(statusFilter);
      await userEvent.click(screen.getByText("To Do"));

      expect(mockOnFilter).toHaveBeenCalledWith({ status: "TODO" });
    });

    it("handles clearing status filter", async () => {
      render(<TaskFilterBar onFilter={mockOnFilter} />);
      const statusFilter = screen.getByPlaceholderText("Filter by Status");

      await userEvent.click(statusFilter);
      await userEvent.click(screen.getByText("To Do"));
      await userEvent.click(statusFilter);
      await userEvent.keyboard("{Backspace}");

      expect(mockOnFilter).toHaveBeenLastCalledWith({ status: "" });
    });
  });

  describe("Search Filter", () => {
    it("calls onFilter with search term after user input", async () => {
      render(<TaskFilterBar onFilter={mockOnFilter} />);
      const searchInput = screen.getByPlaceholderText("Search tasks");

      await userEvent.type(searchInput, "test task");
      await waitFor(() => {
        expect(mockOnFilter).toHaveBeenCalledWith({ search: "test task" });
      });
    });
  });

  describe("Reset Functionality", () => {
    it("resets all filters when reset button is clicked", async () => {
      render(<TaskFilterBar onFilter={mockOnFilter} />);

      // Set some filters first
      const searchInput = screen.getByPlaceholderText("Search tasks");
      await userEvent.type(searchInput, "test");

      const resetButton = screen.getByRole("button", { name: /reset/i });
      await userEvent.click(resetButton);

      expect(mockOnFilter).toHaveBeenCalledWith({});
      expect(searchInput).toHaveValue("");
    });
  });
});
