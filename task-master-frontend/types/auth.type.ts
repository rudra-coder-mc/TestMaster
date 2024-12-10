import { ReactNode } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

interface AxiosErrorResponse {
  response?: {
    data: {
      message: string;
    };
  };
}

interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface MainLayoutProps {
  children: ReactNode;
}
export type {
  LoginFormData,
  AxiosErrorResponse,
  SignupFormData,
  AuthLayoutProps,
  MainLayoutProps,
};
