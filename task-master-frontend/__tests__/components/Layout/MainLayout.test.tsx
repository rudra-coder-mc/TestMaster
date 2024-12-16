import { render, screen, fireEvent, act, within } from "@testing-library/react";
import MainLayout from "@/components/Layout/MainLayout";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import userEvent from "@testing-library/user-event";
import { POST } from "@/utils/http";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/utils/http", () => ({
  POST: jest.fn(() => Promise.resolve({})),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
  remove: jest.fn(),
}));

describe("MainLayout", () => {
  const mockPush = jest.fn();
  const mockUser = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
      pathname: "/",
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
    }));

    (Cookies.get as jest.Mock).mockImplementation((key) => {
      if (key === "user") {
        return JSON.stringify({ role: "user" });
      } else if (key === "admin") {
        return JSON.stringify({ role: "admin" });
      }
      return null;
    });
  });

  it("renders layout components correctly", () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>,
    );

    expect(screen.getByTestId("header-logo")).toBeInTheDocument();
    expect(screen.getByTestId("footer-logo")).toBeInTheDocument();
    expect(screen.getByTestId("main-layout")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("handles menu navigation for different user roles", async () => {
    // Test for regular user
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    const tasksMenuItem = screen.getByTestId("tasks-menu-item");
    expect(tasksMenuItem).toBeInTheDocument();
    expect(within(tasksMenuItem).getByRole("link")).toHaveAttribute(
      "href",
      "/tasks",
    );

    // Test for admin user
    (Cookies.get as jest.Mock).mockReturnValue(
      JSON.stringify({ role: "admin" }),
    );

    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    const adminMenuItem = screen.getByTestId("tasks-management-menu-item");
    expect(adminMenuItem).toBeInTheDocument();
    expect(within(adminMenuItem).getByRole("link")).toHaveAttribute(
      "href",
      "/tasks_management",
    );
  });

  it("highlights active menu item correctly", async () => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      pathname: "/tasks",
      asPath: "/tasks",
      push: mockPush,
    }));

    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    expect(screen.getByTestId("tasks-menu-item")).toHaveClass(
      "ant-menu-item-selected",
    );
  });

  it("handles logout process correctly", async () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    const logoutButton = screen.getByTestId("logout-menu-item");
    await mockUser.click(logoutButton);

    expect(POST).toHaveBeenCalledWith("/auth/logout");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("renders correct menu items based on user permissions", () => {
    // Test with different permission sets
    (Cookies.get as jest.Mock).mockReturnValue(
      JSON.stringify({
        role: "user",
        permissions: ["view_tasks", "create_tasks"],
      }),
    );

    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    expect(screen.getByTestId("tasks-menu-item")).toBeInTheDocument();
    expect(
      screen.queryByTestId("tasks-management-menu-item"),
    ).not.toBeInTheDocument();
  });

  it("handles responsive layout changes", () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>,
    );

    // Test mobile view
    window.innerWidth = 500;
    fireEvent(window, new Event("resize"));

    // Test desktop view window.innerWidth = 1024; fireEvent(window, new Event("resize"));

    // Verify layout adjustments (specific assertions would depend on your implementation)
  });
});
