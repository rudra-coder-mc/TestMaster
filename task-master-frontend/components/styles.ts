import styled, { createGlobalStyle } from "styled-components";
import { Card, Button as AntButton, Layout, Row, Form } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";

export const GlobalStyle = createGlobalStyle`
  /* Global styles to hide the required asterisk */
  .ant-form-item-required::before {
    display: none !important; /* Removes the asterisk */
  }
  .ant-form-item-required {
    font-weight: normal; /* Optional: Remove bold from required label */
  }
`;

const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f9fafb;
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 440px;
  border: none;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-radius: 16px;

  .ant-card-body {
    padding: 32px;
  }
`;

// const LogoContainer = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   justify-content: center;
//   margin-bottom: 1.5rem;
// `;

const LogoCircle = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #9333ea;
`;

const LogoText = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #6b7280;
  text-align: center;
  margin-bottom: 1rem;
`;

const SocialButton = styled(AntButton)`
  background-color: black; /* Default background */
  color: white; /* Default text color */
  border: none; /* Remove border */
  height: 2.75rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover,
  &:focus {
    background-color: #444 !important; /* Override default hover background */
    color: white !important; /* Override default hover text color */
    border: none; /* Ensure no border on hover */
  }

  &:active {
    background-color: #555; /* Darker gray for active state */
  }

  &:disabled {
    background-color: #d1d5db; /* Light gray background for disabled state */
    color: #9ca3af; /* Light gray text color */
    border: none;
  }

  /* Remove the focus ring */
  &:focus-visible {
    box-shadow: none;
  }
`;
const DividerText = styled.span`
  position: relative;
  display: flex;
  justify-content: center;

  span {
    background-color: white;
    padding: 0 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const FormLink = styled.a`
  color: #9333ea;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    color: #7e22ce;
  }
`;

const SignUpText = styled.div`
  text-align: center;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

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

const FilterContainer = styled(Row)`
  margin-bottom: 20px;
  background-color: #f0f2f5;
  padding: 16px;
  border-radius: 8px;
`;

const StyledForm = styled(Form)`
  max-width: 600px;
  margin: 0 auto;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export {
  StyledLayout,
  StyledHeader,
  StyledContent,
  StyledFooter,
  Footer,
  Header,
  Content,
  AuthContainer,
  StyledCard,
  LogoContainer,
  LogoCircle,
  LogoText,
  Title,
  Subtitle,
  SocialButton,
  DividerText,
  FormLink,
  SignUpText,
  StyledSider,
  MenuContainer,
  LogoutContainer,
  FilterContainer,
  StyledForm,
  HeaderContainer,
};
