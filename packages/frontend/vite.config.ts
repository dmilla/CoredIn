import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const __API_URL__ = mode === "development" ? "/api/" : env.VITE_API_URL;
  const __CHAIN_ID__ = env.VITE_CHAIN_ID;

  return {
    define: { __API_URL__, __CHAIN_ID__ },
    resolve: {
      alias: {
        // process: "process/browser",
        util: "util",
        "@": path.resolve(__dirname, "src"),
        "@contracts": path.resolve(__dirname, "contracts")
      }
    },
    optimizeDeps: {
      include: [
        "@coredin/shared/*",
        "@coredin/shared/posts/*",
        "@coredin/shared/credentials/*",
        "@coredin/shared/coreum/*",
        "@coredin/shared/coreum/contract-ts/*"
      ],
      force: true
    },
    build: {
      commonjsOptions: {
        include: [/shared/, /node_modules/]
      },
      rollupOptions: {
        external: []
      }
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "")
        }
      }
    },
    preview: {
      cors: {
        origin: ["*", "https://changenow.io"],
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "x-changenow-api-key"
        ],
        credentials: true,
        exposedHeaders: [
          "Content-Type",
          "Authorization",
          "x-changenow-api-key"
        ],
        maxAge: 3600,
        preflightContinue: false,
        optionsSuccessStatus: 204
      }
    },
    plugins: [nodePolyfills(), react()]
  };
});
