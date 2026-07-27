/// <reference types="@remix-run/cloudflare" />
/// <reference types="vite/client" />

declare module "*.css";

// @types/react-dom@18 only ships declarations for the "react-dom/server" subpath;
// "server.browser" exists at runtime (it's what actually exports renderToReadableStream)
// but has no dedicated types upstream, so we reuse the shared server.d.ts declarations.
declare module "react-dom/server.browser" {
  export * from "react-dom/server";
}
