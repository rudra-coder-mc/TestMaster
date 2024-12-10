import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Ensure js-cookie is installed
import { Layout, Menu } from "antd";
import styled from "styled-components";
import Link from "next/link";
import {
  DashboardOutlined,
  ProjectOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { POST } from "@/utils/http";

const { Sider } = Layout;

const StyledSider = styled(Sider)<{ collapsed: boolean }>`
  overflow: auto;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #001529;
  width: ${({ collapsed }) => (collapsed ? "80px" : "200px")};
  transition: width 0.3s ease-in-out;
`;

const LogoContainer = styled.div<{ collapsed: boolean }>`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${({ collapsed }) => (collapsed ? "16px" : "18px")};
  font-weight: bold;
  background-color: #002140;
  white-space: nowrap;
`;

const MenuContainer = styled.div`
  flex-grow: 1;
`;

const LogoutContainer = styled.div`
  margin-bottom: 16px;
`;

const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}> = ({ collapsed, setCollapsed }) => {
  const [role, setRole] = useState<"user" | "admin" | null>(null); // Manage user role state
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        const cleanedUserCookie = userCookie.startsWith("j:")
          ? userCookie.slice(2)
          : userCookie;

        const user = JSON.parse(cleanedUserCookie);
        setRole(user.role); // Extract role from cookie
      } catch (error) {
        console.error("Invalid JSON in user cookie:", error);
      }
    } else {
      console.warn("No user cookie found.");
    }
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");

    // Call the backend logout endpoint
    await POST("/auth/logout");

    console.log("Cookie destroyed");

    // Redirect to login page after logging out
    router.push("/login");
  };

  // Menu items configuration
  const menuItems = [
    {
      key: "tasks",
      icon: <ProjectOutlined />,
      label: <Link href="/tasks">My Tasks</Link>,
      path: "/tasks",
      roles: ["user"], // Only accessible to users
    },
    {
      key: "TaskManagement",
      icon: <DashboardOutlined />,
      label: <Link href="/tasks_management">Task Management</Link>,
      path: "/tasks_management",
      roles: ["admin"], // Only accessible to admins
    },
  ];

  // Filter menu items based on the role
  const filteredMenuItems = menuItems.filter(
    (item) => role && item.roles.includes(role),
  );

  return (
    <StyledSider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <LogoContainer collapsed={collapsed}>
        {collapsed ? "TM" : "TaskMaster"}
      </LogoContainer>

      <MenuContainer>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.asPath]} // Use router.asPath for query string support
          items={filteredMenuItems.map((item) => ({
            key: item.path,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </MenuContainer>

      <LogoutContainer>
        <Menu
          theme="dark"
          mode="inline"
          items={[
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Logout",
              onClick: handleLogout,
            },
          ]}
        />
      </LogoutContainer>
    </StyledSider>
  );
};

export default Sidebar;
