import { render, screen } from "@testing-library/react";
import AuthLayout from "@/components/Auth/AuthLayout";

describe("AuthLayout", () => {
  it("renders the layout with title and children", () => {
    const title = "Test Title";
    const childContent = "Test Content";

    render(
      <AuthLayout title={title}>
        <div>{childContent}</div>
      </AuthLayout>
    );

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(childContent)).toBeInTheDocument();
  });

  it("renders with styled components", () => {
    render(
      <AuthLayout title="Test">
        <div>Content</div>
      </AuthLayout>
    );

    expect(document.querySelector(".ant-card")).toBeInTheDocument();
    expect(document.querySelector("h1")).toBeInTheDocument();
  });
});
