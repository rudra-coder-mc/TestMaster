import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Ensure js-cookie is installed
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
