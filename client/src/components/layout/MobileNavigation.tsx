/**
 * PKL-278651-UI-0001-MOBNAV
 * Mobile Navigation Component
 * 
 * A bottom navigation bar for mobile devices that provides quick access
 * to the most important parts of the application.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Award, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// No props needed as we get the user from useAuth hook

export function MobileNavigation() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/dashboard' },
    { icon: <Calendar size={20} />, label: 'Matches', path: '/matches' },
    { icon: <Users size={20} />, label: 'Communities', path: '/communities' },
    { icon: <Award size={20} />, label: 'Mastery', path: '/mastery-paths' },
  ];

  // Mobile navigation bar removed as per user request
  // The Floating Action Button (PassportFAB) is now used for universal passport access
  return null;
}