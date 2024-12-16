import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "@/components/Layout/Sidebar";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { POST } from "@/utils/http";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("js-cookie");

jest.mock("@/utils/http", () => ({
  POST: jest.fn(),
}));

describe("Sidebar", () => {
  const mockPush = jest.fn();
  const mockSetCollapsed = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
      asPath: "/",
    }));
  });

  it("renders sidebar with navigation items for admin user", () => {
    (Cookies.get as jest.Mock).mockReturnValue(
      JSON.stringify({ role: "admin" })
    );

    render(<Sidebar collapsed={false} setCollapsed={mockSetCollapsed} />);

    expect(
      screen.getByTestId("tasks-management-menu-item")
    ).toBeInTheDocument();
    expect(screen.getByTestId("logout-menu-item")).toBeInTheDocument();
  });

  it("renders sidebar with navigation items for regular user", () => {
    (Cookies.get as jest.Mock).mockReturnValue(
      JSON.stringify({ role: "user" })
    );

    render(<Sidebar collapsed={false} setCollapsed={mockSetCollapsed} />);

    expect(screen.getByTestId("tasks-menu-item")).toBeInTheDocument();
    expect(screen.getByTestId("logout-menu-item")).toBeInTheDocument();
  });

  it("handles cookie with 'j:' prefix", () => {
    (Cookies.get as jest.Mock).mockReturnValue(
      `j:${JSON.stringify({ role: "admin" })}`
    );

    render(<Sidebar collapsed={false} setCollapsed={mockSetCollapsed} />);

    expect(
      screen.getByTestId("tasks-management-menu-item")
    ).toBeInTheDocument();
  });

  it("handles logout successfully", async () => {
    jest
      .spyOn(Cookies, "get")
      .mockImplementation(() => ({ user: JSON.stringify({ role: "user" }) }));
    (POST as jest.Mock).mockResolvedValueOnce({});

    render(<Sidebar collapsed={false} setCollapsed={mockSetCollapsed} />);

    const logoutButton = screen.getByTestId("logout-menu-item");
    await fireEvent.click(logoutButton);

    expect(POST).toHaveBeenCalledWith("/auth/logout");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("displays correct logo text based on collapse state", () => {
    const { rerender } = render(
      <Sidebar collapsed={false} setCollapsed={mockSetCollapsed} />
    );
    expect(screen.getByText("TaskMaster")).toBeInTheDocument();

    rerender(<Sidebar collapsed={true} setCollapsed={mockSetCollapsed} />);
    expect(screen.getByText("TM")).toBeInTheDocument();
  });
});
