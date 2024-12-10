import { config } from "dotenv";
import withAntdLess from "next-plugin-antd-less";
import { env } from "process";

config();

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true, // This enables styled-components
  },
  env: {
    API_URL: env.API_URL, // Ensure API_URL is correctly defined in .env
  },
  transpilePackages: [
    "antd",
    "@ant-design/icons",
    "@ant-design/icons-svg",
    "@ant-design/pro-components",
    "@ant-design/pro-layout",
    "@ant-design/pro-list",
    "@ant-design/pro-descriptions",
    "@ant-design/pro-form",
    "@ant-design/pro-skeleton",
    "@ant-design/pro-field",
    "@ant-design/pro-utils",
    "@ant-design/pro-provider",
    "@ant-design/pro-card",
    "@ant-design/pro-table",
    "rc-pagination",
    "rc-picker",
    "rc-util",
    "rc-tree",
    "rc-tooltip",
    "rc-table",
  ],
};

export default withAntdLess(nextConfig);
