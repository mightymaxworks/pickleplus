/**
 * PKL-278651-JOUR-002.1: Journey Roles Hook
 * 
 * This hook provides access to the JourneyRoleContext to components
 * that need to interact with the user's pickleball journey roles.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useContext } from 'react';
import { JourneyRoleContext } from '../contexts/JourneyRoleContext';

export function useJourneyRoles() {
  const context = useContext(JourneyRoleContext);
  
  if (!context) {
    throw new Error('useJourneyRoles must be used within a JourneyRoleProvider');
  }
  
  return context;
}