/**
 * Match Management Admin Navigation Item
 * Admin navigation item for the match management system
 */

import React from 'react';
import { Trophy } from 'lucide-react';
import { AdminNavItemProps } from '../../types/AdminNavItem';

export const AdminMatchManagementNavItem: React.FC<AdminNavItemProps> = ({ isActive, onClick }) => {
  return (
    <div
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isActive 
          ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <Trophy className="h-5 w-5" />
      <span className="font-medium">Match Management</span>
    </div>
  );
};

export default AdminMatchManagementNavItem;