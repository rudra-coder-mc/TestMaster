import React, { useState } from "react";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";
import {
  StyledContent,
  StyledFooter,
  StyledHeader,
  StyledLayout,
} from "../styles";
import { MainLayoutProps } from "@/types/auth.type";

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const showSidebar = !["/login", "/signup"].includes(router.pathname);
  const showHeaderAndFooter = !["/login", "/signup"].includes(router.pathname);

  return (
    <StyledLayout>
      <Layout style={{ display: "flex" }}>
        {showSidebar && (
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )}
        <Layout
          style={{
            marginLeft: showSidebar ? (collapsed ? "80px" : "200px") : 0,
            transition: "margin-left 0.3s ease-in-out",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          {showHeaderAndFooter && (
            <StyledHeader>
              <div>TaskMaster</div>
              <div>{/* Add user profile or logout button */}</div>
            </StyledHeader>
          )}
          <StyledContent>{children}</StyledContent>
          {showHeaderAndFooter && (
            <StyledFooter>
              TaskMaster ©{new Date().getFullYear()} Created by Your Company
            </StyledFooter>
          )}
        </Layout>
      </Layout>
    </StyledLayout>
  );
};

export default MainLayout;
