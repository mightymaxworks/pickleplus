import { EventBus } from "../../../core/events/event-bus";
import { getCommunicationPreferencesService } from "./communication-preferences-service";
import { getPartnerPreferencesService } from "./partner-preferences-service";

// Re-export service getter functions
export { getCommunicationPreferencesService, getPartnerPreferencesService };

// Initialize the services
export function initializeUserServices() {
  const eventBus = new EventBus();
  
  // Initialize all services by getting their singleton instances
  getCommunicationPreferencesService(eventBus);
  getPartnerPreferencesService(eventBus);
  
  console.log("User module services initialized");
}