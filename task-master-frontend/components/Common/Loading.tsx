// src/components/Common/Loading.tsx
import React from "react";
import { Spin } from "antd";
import styled from "styled-components";

interface LoadingProps {
  size?: "small" | "default" | "large";
  fullScreen?: boolean;
  tip?: string;
}

const LoadingContainer = styled.div<{ $fullScreen?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${(props) => (props.$fullScreen ? "100vw" : "100%")};
  height: ${(props) => (props.$fullScreen ? "100vh" : "200px")};
  background-color: ${(props) =>
    props.$fullScreen ? "rgba(255, 255, 255, 0.8)" : "transparent"};
  position: ${(props) => (props.$fullScreen ? "fixed" : "relative")};
  top: 0;
  left: 0;
  z-index: 9999;
`;

const Loading: React.FC<LoadingProps> = ({
  size = "default",
  fullScreen = false,
  tip = "Loading...",
}) => {
  return (
    <LoadingContainer $fullScreen={fullScreen}>
      <Spin size={size} tip={tip} spinning />
    </LoadingContainer>
  );
};

export default Loading;
