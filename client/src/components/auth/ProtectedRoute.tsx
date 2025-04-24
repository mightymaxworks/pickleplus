/**
 * PKL-278651-AUTH-0003-ROUTE - Enhanced Protected Route
 * 
 * This component handles authentication and role-based access protection for routes.
 * It provides a consistent loading state, authentication checks, and role verification.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React from "react";
import { Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  layout?: React.ComponentType<{ children: React.ReactNode }>;
  requiredRole?: string;
  exact?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  layout: Layout,
  requiredRole,
  exact = false,
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole } = useAuth();

  // Common loading state component
  const LoadingState = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // Show loading state while authentication state is being determined
  if (isLoading) {
    return (
      <Route path={path} exact={exact}>
        <LoadingState />
      </Route>
    );
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    // Save the attempted URL to redirect back after login
    sessionStorage.setItem("redirectAfterLogin", path);
    
    return (
      <Route path={path} exact={exact}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If role check is required and user doesn't have the role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Route path={path} exact={exact}>
        <Redirect to="/unauthorized" />
      </Route>
    );
  }

  // Render the component with or without layout
  return (
    <Route path={path} exact={exact}>
      {Layout ? (
        <Layout>
          <Component />
        </Layout>
      ) : (
        <Component />
      )}
    </Route>
  );
}