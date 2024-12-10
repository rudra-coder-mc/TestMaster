import React, { Component, ErrorInfo, ReactNode } from "react";
import { Result, Button } from "antd";
import styled from "styled-components";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const ErrorContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback or default error UI
      return (
        this.props.fallback || (
          <ErrorContainer>
            <Result
              status="error"
              title="Something went wrong"
              subTitle="An unexpected error occurred. Please try again."
              extra={
                <Button type="primary" onClick={this.handleReset}>
                  Reload
                </Button>
              }
            />
          </ErrorContainer>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
