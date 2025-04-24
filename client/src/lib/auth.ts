/**
 * PKL-278651-AUTH-0002-CENTR
 * Auth Central Export
 * 
 * Single source of truth for authentication - follows Framework 5.3 principles
 * This file re-exports the context-based authentication system.
 * 
 * @framework Framework5.3
 * @version 1.0.1
 * @lastModified 2025-04-24
 */

// Export the authentication context and hook directly from the context file
export { useAuth, AuthProvider } from '@/contexts/AuthContext';