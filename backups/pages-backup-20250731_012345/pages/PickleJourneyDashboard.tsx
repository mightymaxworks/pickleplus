/**
 * PKL-278651-JOUR-002.3: PickleJourney Dashboard Page
 * 
 * This is the main page that hosts the PickleJourney™ dashboard.
 * It wraps the dashboard with necessary providers for role and emotion context.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastModified 2025-04-28
 */

import { JourneyRoleProvider } from '../modules/picklejourney/contexts/JourneyRoleContext';
import { EmotionProvider } from '../modules/picklejourney/contexts/EmotionContext';
import JourneyDashboard from '../modules/picklejourney/components/dashboard/JourneyDashboard';
// Using Helmet in this component is causing conflicts with the app's HelmetProvider
// We'll set the title through other means

/**
 * PickleJourney Dashboard Page
 * 
 * Wraps the dashboard with necessary providers:
 * - JourneyRoleProvider: Manages the user's pickleball roles
 * - EmotionProvider: Provides emotional intelligence capabilities
 */
export default function PickleJourneyDashboard() {
  return (
    <JourneyRoleProvider>
      <EmotionProvider>
        <JourneyDashboard />
      </EmotionProvider>
    </JourneyRoleProvider>
  );
}