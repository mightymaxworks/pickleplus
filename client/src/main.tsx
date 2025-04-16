// Import Buffer polyfill first to ensure it's available globally
import "./lib/polyfills/buffer";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { registerAllModules } from "./modules/moduleRegistration";
import { Toaster } from "@/components/ui/toaster";

// Register all modules
registerAllModules();

const root = document.getElementById("root")!;

createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster />
  </QueryClientProvider>
);
