import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Menu } from "antd";
import Link from "next/link";
import {
  DashboardOutlined,
  ProjectOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { POST } from "@/utils/http";
import {
  LogoContainer,
  LogoutContainer,
  MenuContainer,
  StyledSider,
} from "../styles";

const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}> = ({ collapsed, setCollapsed }) => {
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      console.warn("No user cookie found.");
      return;
    }

    try {
      const cleanedUserCookie = userCookie.startsWith("j:")
        ? userCookie.slice(2)
        : userCookie;

      const user = JSON.parse(cleanedUserCookie);
      if (user && (user.role === "user" || user.role === "admin")) {
        setRole(user.role);
      } else {
        console.warn("Invalid user role in cookie:", user);
      }
    } catch (error) {
      console.error("Invalid JSON in user cookie:", error);
    }
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    await POST("/auth/logout");
    console.log("Cookie destroyed");
    router.push("/login");
  };

  return (
    <StyledSider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <LogoContainer collapsed={collapsed} data-testid="sidebar-logo">
        {collapsed ? "TM" : "TaskMaster"}
      </LogoContainer>

      <MenuContainer>
        <Menu theme="light" mode="inline" selectedKeys={[router.asPath]}>
          {role === "user" && (
            <Menu.Item
              key="/tasks"
              icon={<ProjectOutlined />}
              data-testid="tasks-menu-item"
            >
              <Link href="/tasks">My Tasks</Link>
            </Menu.Item>
          )}

          {role === "admin" && (
            <Menu.Item
              key="/tasks_management"
              icon={<DashboardOutlined />}
              data-testid="tasks-management-menu-item"
            >
              <Link href="/tasks_management">Task Management</Link>
            </Menu.Item>
          )}
        </Menu>
      </MenuContainer>

      <LogoutContainer>
        <Menu theme="light" mode="inline">
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            data-testid="logout-menu-item"
          >
            Logout
          </Menu.Item>
        </Menu>
      </LogoutContainer>
    </StyledSider>
  );
};

export default Sidebar;
