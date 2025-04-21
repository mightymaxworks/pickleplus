/**
 * PKL-278651-CONN-0006-ROUTE-MOD - PicklePass™ URL Structure Refinement Modernization
 * PKL-278651-CONN-0008-UX-MOD - PicklePass™ UI/UX Enhancement Sprint v2.0
 * 
 * Modern Event Components Export File
 * 
 * This file exports the modernized wrapper components for the PicklePass™ system.
 * 
 * @implementation Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import EventDiscoveryWrapper from '@/components/events/EventDiscoveryWrapper';
import MyEventsWrapper from '@/components/events/MyEventsWrapper';

// Export the modernized event discovery page
export function ModernEventDiscoveryPage() {
  return <EventDiscoveryWrapper />;
}

// Export the modernized my events page
export function ModernMyEventsPage() {
  return <MyEventsWrapper />;
}

// Default export for lazy loading
export default {
  ModernEventDiscoveryPage,
  ModernMyEventsPage
};