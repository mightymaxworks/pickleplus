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
import { Helmet } from 'react-helmet-async';

/**
 * PickleJourney Dashboard Page
 */
export default function PickleJourneyDashboard() {
  return (
    <JourneyRoleProvider>
      <Helmet>
        <title>Your Journey | Pickle+</title>
      </Helmet>
      <JourneyDashboard />
    </JourneyRoleProvider>
  );
}