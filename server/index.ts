import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import * as http from 'http';
import * as path from 'path';
import { setupAuth } from './auth';
import { setupSecurity } from './security';
import { initializeBounceModule } from './modules/bounce';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS to allow credentials
app.use(cors({
  origin: true, // Allow the request origin (will reflect the request origin)
  credentials: true, // Allow cookies to be sent with the request
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'X-Requested-With']
}));

// Add headers for better cookie handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, Set-Cookie');
  next();
});

// Add request logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Add a health check route before any Vite middleware
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  console.log("[Static Files] Serving uploads directory from:", path.join(process.cwd(), 'uploads'));
  
  // Set up authentication
  setupAuth(app);
  
  // Set up security features (after auth but before routes)
  setupSecurity(app);

  // CRITICAL: Register special direct routes first for critical endpoints
  // This is a Framework 5.0 fix for path resolution issues with certain routes
  try {
    // Import and register our special routes
    console.log("[API][CRITICAL] Registering special direct routes before standard routes");
    const { specialRouter } = await import('./special-routes');
    
    // Mount the special router at the API base path
    app.use('/api', specialRouter);
    console.log("[API][CRITICAL] Special routes registered successfully");
  } catch (error) {
    console.error("[API][CRITICAL] Error registering special routes:", error);
  }

  // Initialize Bounce module
  try {
    await initializeBounceModule(app);
    console.log("[Module] Bounce module initialized successfully");
  } catch (error) {
    console.error("[Module] Error initializing Bounce module:", error);
  }

  // Server API Routes and get the HTTP server that will also handle WebSockets
  const serverHttp = await registerRoutes(app);
  
  // Error handler should come after routes but before Vite
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Setup Vite last so its catch-all route doesn't interfere with API routes
  try {
    if (app.get("env") === "development") {
      await setupVite(app, serverHttp);
      console.log("Vite middleware setup complete");
    } else {
      serveStatic(app);
      console.log("Static file serving setup complete");
    }
  } catch (error) {
    console.error("Error setting up frontend serving:", error);
  }

  // Always use port 8080 for Cloud Run
  const port = process.env.PORT || 8080;
  serverHttp.listen({
    port: Number(port),
    host: "0.0.0.0",
  }, () => {
    log(`Server running at http://0.0.0.0:${port}`);
  });
})();
