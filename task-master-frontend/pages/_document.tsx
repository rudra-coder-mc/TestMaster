import React from "react";
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import { ServerStyleSheet } from "styled-components";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const styledComponentsSheet = new ServerStyleSheet();
    const antDesignCache = createCache();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            styledComponentsSheet.collectStyles(
              <StyleProvider cache={antDesignCache}>
                <App {...props} />
              </StyleProvider>,
            ),
        });

      const initialProps = await Document.getInitialProps(ctx);
      const antDesignStyle = extractStyle(antDesignCache, true);

      return {
        ...initialProps,
        styles: (
          <>
            {/* Inject Ant Design styles first */}
            <style dangerouslySetInnerHTML={{ __html: antDesignStyle }} />
            {/* Styled-components styles are added later to take precedence */}
            {styledComponentsSheet.getStyleElement()}
            {initialProps.styles}
          </>
        ),
      };
    } finally {
      styledComponentsSheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
        </Head>
        <body>
          <div className="main-app" id="main-app">
            <Main />
            <NextScript />
          </div>
        </body>
      </Html>
    );
  }
}
