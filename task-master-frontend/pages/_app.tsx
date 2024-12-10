import React from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import theme from "../theme/themeConfig";
import { GlobalStyle } from "../components/styles";
import MainLayout from "@/components/Layout/MainLayout";

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <GlobalStyle />
    <ConfigProvider theme={theme}>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </ConfigProvider>
  </>
);

export default App;
