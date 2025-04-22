/**
 * PKL-278651-BOUNCE-0006-AWARE - Bounce Awareness Enhancement
 * 
 * BounceCollapsibleSection - A collapsible section component optimized for mobile
 * that can be expanded/collapsed to show more detailed information.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BounceCollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
}

export const BounceCollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  className = '',
  titleClassName = '',
  contentClassName = '',
  iconClassName = ''
}: BounceCollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden ${className}`}>
      <button
        onClick={toggleSection}
        className={`w-full px-4 py-3 flex items-center justify-between bg-gray-100 dark:bg-gray-900 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${titleClassName}`}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <div className={`text-gray-500 dark:text-gray-400 ${iconClassName}`}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`px-4 py-3 bg-white dark:bg-gray-950 ${contentClassName}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};