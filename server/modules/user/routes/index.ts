import { Router } from "express";
import communicationPreferencesRoutes from "./communication-preferences-routes";
import partnerPreferencesRoutes from "./partner-preferences-routes";

const router = Router();

// Mount the routes
router.use("/communication", communicationPreferencesRoutes);
router.use("/partner", partnerPreferencesRoutes);

export default router;