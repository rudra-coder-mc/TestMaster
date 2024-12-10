import styled, { createGlobalStyle } from "styled-components";
import { Card, Button as AntButton } from "antd";

// Your existing styled components...

export const GlobalStyle = createGlobalStyle`
  /* Global styles to hide the required asterisk */
  .ant-form-item-required::before {
    display: none !important; /* Removes the asterisk */
  }
  .ant-form-item-required {
    font-weight: normal; /* Optional: Remove bold from required label */
  }
`;

export const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f9fafb;
`;

export const StyledCard = styled(Card)`
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

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

export const LogoCircle = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #9333ea;
`;

export const LogoText = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  text-align: center;
`;

export const Subtitle = styled.p`
  color: #6b7280;
  text-align: center;
  margin-bottom: 1rem;
`;

export const SocialButton = styled(AntButton)`
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
export const DividerText = styled.span`
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

export const FormLink = styled.a`
  color: #9333ea;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    color: #7e22ce;
  }
`;

export const SignUpText = styled.div`
  text-align: center;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;
