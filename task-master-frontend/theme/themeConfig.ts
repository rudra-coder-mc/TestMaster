// theme/themeConfig.ts
import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    // Base
    colorPrimary: "#1890ff", // Primary blue
    colorSuccess: "#52c41a", // Success green
    colorWarning: "#faad14", // Warning yellow
    colorError: "#ff4d4f", // Error red
    colorInfo: "#1890ff", // Info blue

    // Neutral colors
    colorTextBase: "#000000e0", // Base text
    colorBgBase: "#ffffff", // Base background
    colorBorder: "#d9d9d9", // Border color

    // Component specific
    colorBgContainer: "#ffffff", // Container background
    colorBgElevated: "#ffffff", // Elevated container background
    colorBgLayout: "#f5f5f5", // Layout background

    // Typography
    fontSize: 14, // Base font size
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",

    // Border radius
    borderRadius: 6, // Default border radius

    // Spacing
    marginXS: 8, // Extra small margin
    marginSM: 12, // Small margin
    margin: 16, // Default margin
    marginMD: 20, // Medium margin
    marginLG: 24, // Large margin

    // Shadows
    boxShadow:
      "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
  },
};

export const defaultTheme = {
  default: theme,
  token: theme.token,
};

export default defaultTheme;
