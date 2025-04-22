import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    // Skip API routes
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }

    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${Date.now()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible paths for static files
  const possiblePaths = [
    path.resolve(import.meta.dirname, "public"),         // Primary path in production
    path.resolve(import.meta.dirname, "../dist/public"), // Alternate path
    path.resolve(import.meta.dirname, "../client/dist")  // Where client builds directly
  ];
  
  let distPath = "";
  
  // Find the first path that exists
  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      distPath = tryPath;
      console.log(`[Static] Using static files from: ${distPath}`);
      break;
    } else {
      console.log(`[Static] Path not found: ${tryPath}`);
    }
  }

  if (!distPath) {
    console.error("Could not find any static files directory. Paths checked:");
    possiblePaths.forEach(p => console.error(`- ${p}`));
    throw new Error(
      `Could not find any static files directory. Make sure to build the client first`
    );
  }

  // Serve static files
  app.use(express.static(distPath));

  // Serve index.html for client-side routing (skip API routes)
  app.use("*", (req, res, next) => {
    // Skip API routes
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}