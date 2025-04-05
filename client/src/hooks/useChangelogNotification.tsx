import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Version number to match with the banner and landing page
const CURRENT_VERSION = '1.2';
const CHANGELOG_TOAST_SEEN_KEY = 'pickle_plus_changelog_toast_seen';

export function useChangelogNotification() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user has seen this version's changelog toast
    const seenVersions = localStorage.getItem(CHANGELOG_TOAST_SEEN_KEY);
    const hasSeenCurrentVersion = seenVersions ? 
      seenVersions.split(',').includes(CURRENT_VERSION) : false;
    
    if (!hasSeenCurrentVersion) {
      // Show toast notification
      toast({
        title: "What's new in Pickle+ v" + CURRENT_VERSION,
        description: "Coaching connections, enhanced social features, XP improvements, and more!",
        duration: 5000, // 5 seconds
        variant: "default",
        className: "bg-[#FF5722] border-[#FF5722] text-white"
      });
      
      // Mark this version's toast as seen
      const updatedVersions = seenVersions ? 
        seenVersions.split(',').filter(v => v !== CURRENT_VERSION) : [];
      updatedVersions.push(CURRENT_VERSION);
      localStorage.setItem(CHANGELOG_TOAST_SEEN_KEY, updatedVersions.join(','));
    }
  }, [toast]);
}