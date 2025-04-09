/**
 * Match Validation Module Index
 * 
 * PKL-278651-VALMAT-0001-FIX
 * 
 * This module handles match validation functionality, including:
 * - Auto-validation for match submitters
 * - Participant validation/dispute handling
 * - Match validation status management
 */

import { registerValidationRoutes } from "./validationRoutes";
import { 
  autoValidateMatchForSubmitter,
  validateMatch,
  updateMatchValidationStatus,
  getMatchValidationDetails
} from "./validationService";

// Export public API for this module
export {
  // Routes registration
  registerValidationRoutes,
  
  // Services 
  autoValidateMatchForSubmitter,
  validateMatch,
  updateMatchValidationStatus,
  getMatchValidationDetails
};