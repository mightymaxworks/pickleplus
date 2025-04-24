/**
 * PKL-278651-AUTH-0008-ROLES - Role-Based Protected Route
 * Framework 5.3 Implementation
 * 
 * This component provides a simple and direct way to protect routes based on user roles.
 * It follows Framework 5.3 principles of simplicity by:
 * - Providing clear feedback during loading
 * - Using straightforward role checks
 * - Handling all authentication states in one component
 */

import React from "react";
import { Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, hasRequiredRole } from "@/lib/roles";
import { ensureUserHasRole } from "@shared/user-types";

/**
 * Route component that restricts access based on user role
 */
export function RoleProtectedRoute({
  path,
  component: Component,
  requiredRole = UserRole.PLAYER,
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: UserRole;
}) {
  const { user, isLoading, getUserRole } = useAuth();
  
  // Show loading spinner while authenticating
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }
  
  // Not logged in - redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // Check if user has the required role
  const userRole = getUserRole();
  
  if (!userRole || !hasRequiredRole(userRole, requiredRole)) {
    // Redirect to appropriate page based on their role
    return (
      <Route path={path}>
        <Redirect to="/dashboard" />
      </Route>
    );
  }

  // User has appropriate role, render the component
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}