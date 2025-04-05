import { ProfileService } from './profile-service';
import { XPService } from './xp-service';
import type { IProfileService, IXPService } from './interfaces';

// Create singleton instances of services
const profileService: IProfileService = new ProfileService();
const xpService: IXPService = new XPService();

// Export service instances
export {
  profileService,
  xpService,
  // Types
  IProfileService,
  IXPService
};