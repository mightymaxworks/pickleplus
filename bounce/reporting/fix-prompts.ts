/**
 * PKL-278651-BOUNCE-0020-FIX-PROMPTS - Fix Prompts Generator
 * 
 * Generates actionable fix prompts for findings to guide developers
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { BounceFindingSeverity } from "../../shared/schema/bounce";

/**
 * Generate fix prompts based on finding data
 * @param finding The finding to generate a fix prompt for
 * @returns Fix prompt object with action items and code suggestions
 */
export function generateFixPrompt(finding: any): FixPrompt {
  // Get appropriate fix strategy based on area and severity
  const fixStrategy = getFixStrategy(finding.area, finding.severity);
  
  // Generate specific prompt based on finding details
  return {
    actionItems: generateActionItems(finding, fixStrategy),
    codeExamples: generateCodeExamples(finding, fixStrategy),
    testingSteps: generateTestingSteps(finding, fixStrategy),
  };
}

/**
 * Fix prompt object structure
 */
export interface FixPrompt {
  actionItems: string[];
  codeExamples: string;
  testingSteps: string[];
}

/**
 * Fix strategy object
 */
interface FixStrategy {
  approach: string;
  recommendations: string[];
  codePatterns: string;
  testingRecommendations: string[];
}

/**
 * Get appropriate fix strategy based on area and severity
 */
function getFixStrategy(area: string, severity: BounceFindingSeverity): FixStrategy {
  // Strategies organized by area
  const strategies: Record<string, FixStrategy> = {
    'AUTHENTICATION': {
      approach: 'Improve error handling and user feedback for authentication flows',
      recommendations: [
        'Add clear session expiration handling',
        'Implement refresh token pattern',
        'Show user-friendly error messages',
        'Add auto-redirect to login page on session timeout',
        'Implement session timeout interceptor in API client'
      ],
      codePatterns: `// Example session timeout handler
function handleSessionTimeout() {
  // Clear local auth state
  authContext.clearAuth();
  
  // Show friendly message
  toast({
    title: "Session Expired",
    description: "Your session has expired. Please log in again.",
    variant: "warning"
  });
  
  // Redirect to login
  navigate("/auth", { 
    state: { returnTo: location.pathname, sessionExpired: true } 
  });
}

// Add this to your API request error handling
if (error.status === 401) {
  handleSessionTimeout();
  return;
}`,
      testingRecommendations: [
        'Test by manually expiring the session token',
        'Verify proper redirect to login page',
        'Ensure original URL is preserved for after login',
        'Confirm user-friendly message is displayed'
      ]
    },
    'COMMUNITY': {
      approach: 'Enhance responsive design for community pages',
      recommendations: [
        'Use responsive grid layouts that adapt to screen size',
        'Implement proper media queries for smaller devices',
        'Consider mobile-first approach for critical elements',
        'Ensure text and buttons are properly sized on mobile'
      ],
      codePatterns: `// Example responsive CSS fixes
.community-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

@media (max-width: 375px) {
  .community-details {
    grid-template-columns: 1fr;
  }
  
  .community-stats {
    flex-direction: column;
  }
  
  .community-header h1 {
    font-size: 1.25rem;
  }
}`,
      testingRecommendations: [
        'Test on actual mobile devices with varying screen sizes',
        'Use browser dev tools to emulate different device dimensions',
        'Verify text readability and touch target sizes',
        'Ensure no horizontal scrolling occurs'
      ]
    },
    'TOURNAMENTS': {
      approach: 'Optimize tournament bracket rendering for large datasets',
      recommendations: [
        'Implement horizontal scrolling controls for large brackets',
        'Add zoom functionality for better navigation',
        'Consider pagination or virtualization for very large brackets',
        'Provide a compact view option for mobile devices'
      ],
      codePatterns: `// Example bracket container with scroll controls
const BracketContainer = () => {
  const containerRef = useRef(null);
  
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollLeft -= 300;
    }
  };
  
  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollLeft += 300;
    }
  };
  
  return (
    <div className="bracket-navigation">
      <button onClick={scrollLeft} className="scroll-button left">
        <ChevronLeft />
      </button>
      
      <div 
        ref={containerRef} 
        className="bracket-scroll-container"
      >
        <TournamentBracket participants={participants} />
      </div>
      
      <button onClick={scrollRight} className="scroll-button right">
        <ChevronRight />
      </button>
    </div>
  );
};

// Corresponding CSS
.bracket-navigation {
  position: relative;
  width: 100%;
}

.bracket-scroll-container {
  overflow-x: auto;
  scrollbar-width: thin;
  padding: 1rem 0;
}

.scroll-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  padding: 0.5rem;
}

.scroll-button.left { left: 0.5rem; }
.scroll-button.right { right: 0.5rem; }`,
      testingRecommendations: [
        'Test with maximum number of expected participants',
        'Verify scrolling controls work smoothly',
        'Ensure bracket is navigable on both desktop and mobile',
        'Check that all participant information is readable'
      ]
    },
    'PROFILE': {
      approach: 'Ensure cross-browser compatibility for image uploads',
      recommendations: [
        'Use browser-agnostic image preview techniques',
        'Add Safari-specific CSS fixes if needed',
        'Test file input handling across browsers',
        'Consider using a cross-browser tested image upload library'
      ],
      codePatterns: `// Cross-browser image preview handler
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Create a blob URL (works in all browsers)
  const objectUrl = URL.createObjectURL(file);
  
  // Update preview
  setPreviewImage(objectUrl);
  
  // Clean up the URL when component unmounts
  return () => URL.revokeObjectURL(objectUrl);
}

// Safari-specific CSS if needed
@supports (-webkit-touch-callout: none) {
  .image-preview {
    /* Safari-specific styles */
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
}`,
      testingRecommendations: [
        'Test on Safari, Chrome, Firefox, and Edge',
        'Verify image preview works with different image formats',
        'Check mobile Safari behavior specifically',
        'Ensure error handling for invalid files works in all browsers'
      ]
    },
    'UI': {
      approach: 'Standardize UI components across the application',
      recommendations: [
        'Create consistent button styling using shared components',
        'Define a style guide for UI elements',
        'Use CSS variables for consistent theming',
        'Implement a design system component library'
      ],
      codePatterns: `// Standardized button component
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Button styling variants
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Use consistent buttons throughout the app
export const Button = ({ className, variant, size, ...props }) => (
  <button 
    className={cn(buttonVariants({ variant, size }), className)} 
    {...props} 
  />
);

// Refactor settings page to use standard components
function SettingsPage() {
  return (
    <div className="settings-container">
      <h1>Account Settings</h1>
      
      {/* Use consistent button components */}
      <Button variant="default">Save Changes</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete Account</Button>
    </div>
  );
}`,
      testingRecommendations: [
        'Compare buttons across different pages for consistency',
        'Check hover, focus, and active states',
        'Verify accessibility features work properly',
        'Test responsive behavior of UI elements'
      ]
    }
  };
  
  // Default strategy for areas not explicitly defined
  const defaultStrategy: FixStrategy = {
    approach: 'Analyze and address the issue based on best practices',
    recommendations: [
      'Review related code for similar issues',
      'Implement proper error handling',
      'Ensure responsive design principles',
      'Add comprehensive testing'
    ],
    codePatterns: `// Generic fix approach
// 1. Identify the problematic code
// 2. Create tests to reproduce the issue
// 3. Implement a fix following best practices
// 4. Verify the fix works as expected`,
    testingRecommendations: [
      'Create test cases that reproduce the issue',
      'Develop unit and integration tests',
      'Verify fix across different environments',
      'Document the solution for future reference'
    ]
  };
  
  // Return appropriate strategy or default if not found
  return strategies[area] || defaultStrategy;
}

/**
 * Generate actionable items based on finding and strategy
 */
function generateActionItems(finding: any, strategy: FixStrategy): string[] {
  // Start with strategy recommendations
  const actionItems = [...strategy.recommendations];
  
  // Add specific action based on finding description
  if (finding.description.includes('session timeout')) {
    actionItems.push('Implement a session timeout interceptor');
    actionItems.push('Add a session renewal mechanism');
  }
  
  if (finding.description.includes('responsive')) {
    actionItems.push('Update media queries to cover screen widths below 375px');
    actionItems.push('Test layouts on various mobile devices');
  }
  
  if (finding.description.includes('overflow')) {
    actionItems.push('Add horizontal scrolling controls');
    actionItems.push('Implement content virtualization for large datasets');
  }
  
  if (finding.description.includes('Safari')) {
    actionItems.push('Add Safari-specific CSS fixes');
    actionItems.push('Test on multiple versions of Safari');
  }
  
  if (finding.description.includes('inconsistent')) {
    actionItems.push('Audit all button styles across the application');
    actionItems.push('Create a standardized button component library');
  }
  
  return actionItems;
}

/**
 * Generate code examples based on finding and strategy
 */
function generateCodeExamples(finding: any, strategy: FixStrategy): string {
  // Return the code patterns from the strategy
  return strategy.codePatterns;
}

/**
 * Generate testing steps based on finding and strategy
 */
function generateTestingSteps(finding: any, strategy: FixStrategy): string[] {
  // Start with strategy testing recommendations
  const testingSteps = [...strategy.testingRecommendations];
  
  // Add specific testing step based on affected URL
  testingSteps.push(`Test the fix on ${finding.affected_url}`);
  
  return testingSteps;
}