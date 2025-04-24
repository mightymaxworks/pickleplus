/**
 * PKL-278651-CONN-0004-PASS-REG-UI-PHASE2
 * Auth utility wrapper for the Passport-centric approach
 */

// Export the useAuth hook from the hooks directory
// Re-export the new auth context for backward compatibility
export { useAuth, AuthProvider } from '@/contexts/AuthContext';