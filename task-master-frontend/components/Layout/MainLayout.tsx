import React, { ReactNode, useState } from "react";
import { Layout } from "antd";
import styled from "styled-components";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";

const { Header, Content, Footer } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled(Header)`
  background-color: #ffffff;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledContent = styled(Content)`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  flex-grow: 1; /* Ensure content takes up the remaining space */
`;

const StyledFooter = styled(Footer)`
  text-align: center;
  padding: 16px;
`;

interface MainLayoutProps {
  children: ReactNode;
}

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
