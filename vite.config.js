import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// In dev, serve /api/* from the same files Vercel deploys as serverless functions.
function devApi() {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api/")) return next();
        const name = req.url.split("?")[0].slice(5).replace(/[^a-z-]/g, "");
        try {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const raw = Buffer.concat(chunks).toString();
          req.body = raw ? JSON.parse(raw) : {};
          res.status = (code) => ((res.statusCode = code), res);
          res.json = (obj) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(obj));
          };
          const mod = await server.ssrLoadModule(`/api/${name}.js`);
          await mod.default(req, res);
        } catch (e) {
          console.error(e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(e.message || e) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Server-only secrets: copy into process.env for the dev API. Never prefixed VITE_, so never bundled.
  const env = loadEnv(mode, process.cwd(), "");
  if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  return {
    plugins: [react(), tailwindcss(), devApi()],
    server: { host: true },
  };
});
