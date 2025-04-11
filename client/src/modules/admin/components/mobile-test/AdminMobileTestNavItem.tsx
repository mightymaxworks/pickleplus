/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Admin Mobile Test Nav Item
 * 
 * This component registers the mobile test page in the admin navigation.
 */

import React from 'react';
import { Smartphone } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminMobileTestNavItem() {
  return (
    <Link to="/admin/mobile-test">
      <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary">
        <Smartphone size={18} />
        <span>Mobile Test</span>
      </div>
    </Link>
  );
}