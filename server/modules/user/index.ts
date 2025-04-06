import { Router } from "express";
import routes from "./routes";
import { initializeUserServices } from "./services";

// Export the module's router
export const userRouter = Router();

// Mount the module's routes
userRouter.use("/preferences", routes);

// Initialize the module
export function initializeUserModule() {
  // Initialize services
  initializeUserServices();
  
  console.log("User module initialized");
  
  return userRouter;
}