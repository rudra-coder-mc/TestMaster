import "styled-components";
import type { ThemeConfig } from "antd";

declare module "styled-components" {
  export interface DefaultTheme {
    default: ThemeConfig;
    token: ThemeConfig["token"];
  }
}
