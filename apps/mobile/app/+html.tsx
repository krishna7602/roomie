import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
export default function Root({ children }: { children: ReactNode }) {
  const { headNodes, bodyAttributes, bodyNodes } = useServerDocumentContext();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Normalizes body and scroll behavior */}
        <ScrollViewStyleReset />

        {/* Global Web Typography & Resets */}
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

        {/* Injects React Native Web StyleSheet and dynamic metadata */}
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}

        {/* Injects client-side scripts and hydration bundles */}
        {bodyNodes}
      </body>
    </html>
  );
}

const globalStyles = `
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #f1f5f9;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
* {
  box-sizing: border-box;
}
`;
