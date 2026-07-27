import { defineConfig } from "@remix-run/dev";
import { cloudflarePages } from "@remix-run/cloudflare-pages";

export default defineConfig({
  ignoreDeprecations: ["future-default-exports"],
  build: {
    publicPath: "/",
  },
  server: cloudflarePages(),
});
