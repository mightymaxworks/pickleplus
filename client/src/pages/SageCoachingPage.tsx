/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Coaching Page
 * 
 * This page hosts the SAGE coaching panel and handles authentication.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { useAuth } from "@/contexts/AuthContext";
import SageCoachingPanel from "@/components/sage/SageCoachingPanel";
import { Loader2 } from "lucide-react";

export default function SageCoachingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-2xl font-bold">Authentication Required</h1>
        <p className="mb-6">
          Please log in to access the S.A.G.E. coaching features.
        </p>
      </div>
    );
  }

  return <SageCoachingPanel />;
}