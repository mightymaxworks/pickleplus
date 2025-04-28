/**
 * PKL-278651-JOUR-002.1: PickleJourney Dashboard Page
 * 
 * This is the main page that hosts the PickleJourney™ dashboard.
 * It wraps the dashboard with necessary providers for role context.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { JourneyRoleProvider } from '../modules/picklejourney/contexts/JourneyRoleContext';
import JourneyDashboard from '../modules/picklejourney/components/dashboard/JourneyDashboard';
// Using Helmet in this component is causing conflicts with the app's HelmetProvider
// We'll set the title through other means

/**
 * PickleJourney Dashboard Page
 */
export default function PickleJourneyDashboard() {
  return (
    <JourneyRoleProvider>
      <JourneyDashboard />
    </JourneyRoleProvider>
  );
}