/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Passport Verification Page
 * 
 * This page handles the verification of PicklePass™ passports,
 * with responsive layout for both mobile and desktop views.
 * Note: Authentication and admin checks are handled by AdminProtectedRoute
 */

import React from "react";
import { useIsMobile } from "@/modules/admin/utils/deviceDetection";
import { ResponsivePassportVerification } from "@/modules/admin/components/responsive";

const PassportVerificationPage: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Use our responsive component which will render based on device type
  // Note: AdminLayout is provided by AdminProtectedRoute wrapper
  return <ResponsivePassportVerification />;
};

export default PassportVerificationPage;