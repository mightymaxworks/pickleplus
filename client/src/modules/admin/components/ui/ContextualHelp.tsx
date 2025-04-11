/**
 * PKL-278651-ADMIN-0014-UX
 * Contextual Help Component
 * 
 * This component provides contextual help and guidance for admin interface elements,
 * including step-by-step guides, tooltips, and context-aware assistance.
 */

import React, { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { 
  HelpCircle, 
  X, 
  ArrowRight, 
  Info, 
  ExternalLink, 
  ChevronRight, 
  Link as LinkIcon,
  Book,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

// Help content types
export interface HelpMenuItem {
  id: string;
  title: string;
  description: string;
  content: ReactNode;
  icon?: ReactNode;
  tags?: string[];
  category?: string;
}

interface HelpArticle extends HelpMenuItem {
  lastUpdated?: string;
  relatedArticles?: string[]; // IDs of related articles
}

interface HelpStep {
  title: string;
  description: ReactNode;
  target?: string; // CSS selector for the target element
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface GuidedTour {
  id: string;
  title: string;
  description: string;
  steps: HelpStep[];
}

// Context type definition
interface HelpContextType {
  openHelpPanel: () => void;
  closeHelpPanel: () => void;
  navigateToArticle: (articleId: string) => void;
  startGuidedTour: (tourId: string) => void;
  stopGuidedTour: () => void;
  registerHelpContent: (content: HelpMenuItem) => void;
  unregisterHelpContent: (id: string) => void;
  registerGuidedTour: (tour: GuidedTour) => void;
  unregisterGuidedTour: (id: string) => void;
  currentLocation: string;
  setCurrentLocation: (location: string) => void;
  isPanelOpen: boolean;
  activeArticleId: string | null;
  activeTourId: string | null;
  currentStepIndex: number;
}

// Create the context
const HelpContext = createContext<HelpContextType>({
  openHelpPanel: () => {},
  closeHelpPanel: () => {},
  navigateToArticle: () => {},
  startGuidedTour: () => {},
  stopGuidedTour: () => {},
  registerHelpContent: () => {},
  unregisterHelpContent: () => {},
  registerGuidedTour: () => {},
  unregisterGuidedTour: () => {},
  currentLocation: '/',
  setCurrentLocation: () => {},
  isPanelOpen: false,
  activeArticleId: null,
  activeTourId: null,
  currentStepIndex: 0,
});

// Hook to use help context
export const useHelp = () => useContext(HelpContext);

// Provider component
interface HelpProviderProps {
  children: ReactNode;
  defaultArticles?: HelpArticle[];
  defaultTours?: GuidedTour[];
}

export function HelpProvider({ children, defaultArticles = [], defaultTours = [] }: HelpProviderProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<HelpMenuItem[]>(defaultArticles);
  const [guidedTours, setGuidedTours] = useState<GuidedTour[]>(defaultTours);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('/');
  
  // Panel handlers
  const openHelpPanel = () => setIsPanelOpen(true);
  const closeHelpPanel = () => setIsPanelOpen(false);
  
  // Article navigation
  const navigateToArticle = (articleId: string) => {
    setActiveArticleId(articleId);
    openHelpPanel();
  };
  
  // Guided tour handlers
  const startGuidedTour = (tourId: string) => {
    setActiveTourId(tourId);
    setCurrentStepIndex(0);
    closeHelpPanel(); // Close the panel to show the tour
  };
  
  const stopGuidedTour = () => {
    setActiveTourId(null);
    setCurrentStepIndex(0);
  };
  
  // Content registration
  const registerHelpContent = (content: HelpMenuItem) => {
    setHelpContent(prev => {
      // Remove any existing content with the same ID
      const filtered = prev.filter(item => item.id !== content.id);
      return [...filtered, content];
    });
  };
  
  const unregisterHelpContent = (id: string) => {
    setHelpContent(prev => prev.filter(item => item.id !== id));
  };
  
  // Tour registration
  const registerGuidedTour = (tour: GuidedTour) => {
    setGuidedTours(prev => {
      // Remove any existing tour with the same ID
      const filtered = prev.filter(item => item.id !== tour.id);
      return [...filtered, tour];
    });
  };
  
  const unregisterGuidedTour = (id: string) => {
    setGuidedTours(prev => prev.filter(tour => tour.id !== id));
  };
  
  // Register default content
  useEffect(() => {
    // Add some default/common help articles
    registerHelpContent({
      id: 'admin-dashboard-overview',
      title: 'Admin Dashboard Overview',
      description: 'Learn how to navigate and use the admin dashboard effectively',
      content: (
        <div className="space-y-4">
          <p>
            The admin dashboard provides a central place to manage all aspects of your Pickle+ platform.
            Here are the key areas you'll find:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Dashboard Overview</strong>: Quick stats and metrics about platform activity</li>
            <li><strong>User Management</strong>: Tools for managing user accounts, roles, and permissions</li>
            <li><strong>Event Management</strong>: Create and manage pickleball events and tournaments</li>
            <li><strong>Game Management</strong>: Configure game settings, courts, and match parameters</li>
            <li><strong>Content Management</strong>: Manage website content, announcements, and news</li>
            <li><strong>System Settings</strong>: Configure system-wide settings and preferences</li>
          </ul>
          <p>
            Each section has specific tools and features to help you manage your platform efficiently.
            Use the navigation sidebar to access different sections of the admin panel.
          </p>
        </div>
      ),
      icon: <Info />,
      category: 'Getting Started',
    });
    
    // Register a basic guided tour
    registerGuidedTour({
      id: 'admin-dashboard-tour',
      title: 'Admin Dashboard Tour',
      description: 'A guided tour of the admin dashboard features',
      steps: [
        {
          title: 'Welcome to the Admin Dashboard',
          description: (
            <div>
              <p>Welcome to the Pickle+ Admin Dashboard! This tour will guide you through the key features.</p>
              <p className="text-muted-foreground mt-2">Click "Next" to continue.</p>
            </div>
          ),
        },
        {
          title: 'Navigation Sidebar',
          description: (
            <div>
              <p>The sidebar gives you access to all administrative functions. Click on any item to navigate to that section.</p>
              <p className="text-muted-foreground mt-2">Categories are organized by function for easy access.</p>
            </div>
          ),
          target: '.admin-sidebar',
          position: 'right',
        },
        {
          title: 'Dashboard Metrics',
          description: (
            <div>
              <p>The dashboard displays key metrics about your platform. You can filter by time period using the dropdown.</p>
              <p className="text-muted-foreground mt-2">Data refreshes automatically or you can manually refresh.</p>
            </div>
          ),
          target: '.dashboard-metrics',
          position: 'bottom',
        },
        {
          title: 'Quick Actions',
          description: (
            <div>
              <p>Quick actions provide one-click access to common tasks like creating events or managing users.</p>
              <p className="text-muted-foreground mt-2">Use these to save time on frequent tasks.</p>
            </div>
          ),
          target: '.quick-actions',
          position: 'left',
        },
        {
          title: 'Help Resources',
          description: (
            <div>
              <p>Click the help icon in the header anytime to access contextual help and guides.</p>
              <p className="text-muted-foreground mt-2">You've completed the tour! You can restart it anytime from the help panel.</p>
            </div>
          ),
          target: '.help-button',
          position: 'bottom',
        },
      ],
    });
  }, []);
  
  return (
    <HelpContext.Provider
      value={{
        openHelpPanel,
        closeHelpPanel,
        navigateToArticle,
        startGuidedTour,
        stopGuidedTour,
        registerHelpContent,
        unregisterHelpContent,
        registerGuidedTour,
        unregisterGuidedTour,
        currentLocation,
        setCurrentLocation,
        isPanelOpen,
        activeArticleId,
        activeTourId,
        currentStepIndex,
      }}
    >
      {children}
      
      {/* Help Panel */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="px-1">
            <SheetTitle>Help & Support</SheetTitle>
            <SheetDescription>
              Find guides, tutorials and assistance for the admin dashboard.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {activeArticleId ? (
              // Display active article
              (() => {
                const article = helpContent.find(item => item.id === activeArticleId);
                return article ? (
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center text-muted-foreground"
                      onClick={() => setActiveArticleId(null)}
                    >
                      <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                      Back to help center
                    </Button>
                    
                    <div className="pb-2">
                      <h3 className="text-lg font-semibold mb-1">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{article.description}</p>
                      
                      {article.category && (
                        <div className="flex items-center mt-2">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                            {article.category}
                          </span>
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {article.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground">Article not found</p>
                    <Button 
                      variant="outline"
                      className="mt-2"
                      onClick={() => setActiveArticleId(null)}
                    >
                      Return to help center
                    </Button>
                  </div>
                );
              })()
            ) : (
              // Help center overview
              <>
                <div className="grid grid-cols-1 gap-2">
                  <h3 className="text-sm font-medium mb-1">Getting Started</h3>
                  {helpContent
                    .filter(item => item.category === 'Getting Started')
                    .map(item => (
                      <Button
                        key={item.id}
                        variant="outline"
                        className="justify-start h-auto py-2 px-3"
                        onClick={() => setActiveArticleId(item.id)}
                      >
                        <div className="flex items-center">
                          <div className="mr-2 text-primary">
                            {item.icon || <Book className="h-4 w-4" />}
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-medium">{item.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Guided Tours</h3>
                  {guidedTours.map(tour => (
                    <Button
                      key={tour.id}
                      variant="outline"
                      className="justify-start w-full h-auto py-2 px-3 mb-2"
                      onClick={() => {
                        startGuidedTour(tour.id);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="mr-2 text-primary">
                          <Video className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-medium">{tour.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{tour.description}</p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Popular Help Topics</h3>
                  {helpContent
                    .filter(item => item.category !== 'Getting Started')
                    .slice(0, 3)
                    .map(item => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="justify-start w-full h-auto py-1.5 px-2"
                        onClick={() => setActiveArticleId(item.id)}
                      >
                        <div className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{item.title}</span>
                        </div>
                      </Button>
                    ))}
                </div>
                
                <div className="pt-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="py-3 px-3">
                      <CardTitle className="text-sm">Need more help?</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-3">
                      <div className="text-xs text-muted-foreground">
                        Contact support for additional assistance with your admin dashboard.
                      </div>
                    </CardContent>
                    <CardFooter className="py-2 px-3">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.open('mailto:support@pickleplus.com')}
                      >
                        <EmailIcon className="h-4 w-4 mr-1" /> Contact Support
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Guided Tour Overlay */}
      <AnimatePresence>
        {activeTourId && (
          <TourStep
            tour={guidedTours.find(tour => tour.id === activeTourId)!}
            currentStepIndex={currentStepIndex}
            onNext={() => {
              const tour = guidedTours.find(tour => tour.id === activeTourId)!;
              if (currentStepIndex < tour.steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
              } else {
                stopGuidedTour();
              }
            }}
            onPrevious={() => {
              if (currentStepIndex > 0) {
                setCurrentStepIndex(prev => prev - 1);
              }
            }}
            onClose={stopGuidedTour}
          />
        )}
      </AnimatePresence>
    </HelpContext.Provider>
  );
}

// Tour step component
interface TourStepProps {
  tour: GuidedTour;
  currentStepIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

function TourStep({ tour, currentStepIndex, onNext, onPrevious, onClose }: TourStepProps) {
  const step = tour.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tour.steps.length - 1;
  
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  useEffect(() => {
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const position = getPositionFromTarget(rect, step.position || 'bottom');
        setPosition(position);
      }
    } else {
      // Center in viewport if no target
      setPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
      });
    }
  }, [step, currentStepIndex]);
  
  const getPositionFromTarget = (
    rect: DOMRect,
    position: 'top' | 'right' | 'bottom' | 'left'
  ) => {
    const offset = 12; // Distance from target
    const tooltipWidth = 300;
    const tooltipHeight = 150;
    
    switch (position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - offset,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + offset,
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - offset,
        };
      case 'bottom':
      default:
        return {
          top: rect.bottom + offset,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        };
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000,
      }}
      className="w-[300px] bg-popover rounded-lg shadow-lg border border-border p-4"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{step.title}</h4>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        {step.description}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-muted-foreground">
          Step {currentStepIndex + 1} of {tour.steps.length}
        </div>
        
        <div className="flex gap-2">
          {!isFirstStep && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPrevious}
            >
              Previous
            </Button>
          )}
          
          <Button 
            size="sm" 
            onClick={onNext}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Help Button component
interface HelpButtonProps {
  className?: string;
}

export function HelpButton({ className }: HelpButtonProps) {
  const { openHelpPanel } = useHelp();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openHelpPanel}
      className={cn("help-button", className)}
      aria-label="Open help center"
    >
      <HelpCircle className="h-5 w-5" />
    </Button>
  );
}

// Email icon component
function EmailIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}