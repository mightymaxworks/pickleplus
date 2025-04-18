/**
 * PKL-278651-COMM-0019-MOBILE
 * Community Admin Floating Action Button
 * 
 * This component provides a mobile-friendly floating action button
 * for community administrators to access management functions.
 * Following Framework 5.1 standards with enhanced animations.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Edit, 
  Users, 
  Calendar, 
  Image, 
  X, 
  AlignLeft,
  ShieldCheck
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useMediaQuery } from '@/hooks/use-media-query';

interface CommunityAdminFABProps {
  communityId: number;
}

interface AdminActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  delay: number;
}

const AdminAction = ({ icon, label, onClick, delay }: AdminActionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.8 }}
    transition={{ delay: delay * 0.05, duration: 0.2 }}
    className="flex items-center gap-2 bg-card p-3 rounded-full shadow-lg cursor-pointer 
              transform transition-all hover:scale-105 border border-border"
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <span className="text-sm font-medium bg-background/90 rounded-full px-3 py-1 backdrop-blur-sm border border-border">
      {label}
    </span>
    <div className="bg-primary text-primary-foreground p-2 rounded-full">
      {icon}
    </div>
  </motion.div>
);

export function CommunityAdminFAB({ communityId }: CommunityAdminFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setIsOpen(false);

    // Navigate to the appropriate admin section
    switch (option) {
      case 'visual-settings':
        navigate(`/communities/${communityId}?tab=manage&section=visual`);
        break;
      case 'general-settings':
        navigate(`/communities/${communityId}?tab=manage&section=general`);
        break;
      case 'members':
        navigate(`/communities/${communityId}?tab=manage&section=members`);
        break;
      case 'events':
        navigate(`/communities/${communityId}?tab=manage&section=events`);
        break;
      case 'content':
        navigate(`/communities/${communityId}?tab=manage&section=content`);
        break;
      default:
        navigate(`/communities/${communityId}?tab=manage`);
        break;
    }
  };

  // Admin actions configuration
  const adminActions = [
    {
      icon: <Image size={20} />,
      label: "Visual Settings",
      onClick: () => handleOptionClick('visual-settings'),
      delay: 1
    },
    {
      icon: <Settings size={20} />,
      label: "General Settings",
      onClick: () => handleOptionClick('general-settings'),
      delay: 2
    },
    {
      icon: <Users size={20} />,
      label: "Manage Members",
      onClick: () => handleOptionClick('members'),
      delay: 3
    },
    {
      icon: <Calendar size={20} />,
      label: "Manage Events",
      onClick: () => handleOptionClick('events'),
      delay: 4
    },
    {
      icon: <AlignLeft size={20} />,
      label: "Manage Content",
      onClick: () => handleOptionClick('content'),
      delay: 5
    }
  ];

  return (
    <>
      {/* Backdrop - only shown when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Menu Items - shown when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed bottom-24 right-6 flex flex-col-reverse items-end gap-3 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {adminActions.map((action, index) => (
              <AdminAction 
                key={index}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
                delay={action.delay}
              />
            ))}
            
            {/* Title for the menu */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="mb-2 bg-card px-4 py-2 rounded-lg shadow-md border border-border"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span className="font-semibold">Admin Controls</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={toggleMenu}
        className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} p-4 rounded-full shadow-lg z-50
          ${isOpen ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border-2 
          ${isOpen ? 'border-destructive/50' : 'border-primary/50'}`}
        aria-label={isOpen ? "Close management menu" : "Open management menu"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X size={24} /> : <Settings size={24} />}
        </motion.div>
      </motion.button>
    </>
  );
}