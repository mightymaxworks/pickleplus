/**
 * PKL-278651-BOUNCE-0005-REPORTING
 * Enhanced Bug Report Generator with Fix Prompts
 * 
 * This module generates comprehensive bug reports with:
 * 1. Well-structured test findings with severity classification
 * 2. Framework 5.2 ID codes for each issue
 * 3. Actionable fix prompts with code examples
 * 4. Testing steps for verification
 * 5. Severity-based statistics and pass/fail recommendations
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import { TestResult, TestRun, BugReport, BugFinding, SeverityLevel } from '../types';
import { formatDate, formatTimestamp } from '../utils/date-utils';
import { getBrowserInfo } from '../utils/browser-detection';

// Generate unique Framework 5.2 ID for bug findings
function generateFrameworkId(category: string, index: number): string {
  // Use a fixed project code
  const projectCode = 'PKL-278651';
  
  // Category codes based on area of the application
  const categoryCode = category.toUpperCase().substring(0, 4);
  
  // Sequential number with leading zeros
  const sequentialNumber = index.toString().padStart(4, '0');
  
  return `${projectCode}-${categoryCode}-${sequentialNumber}`;
}

// Generate fix prompts based on bug finding
function generateFixPrompt(finding: BugFinding): string {
  const basePrompt = `## Fix Recommendation for ${finding.id}\n\n`;
  
  // Different prompt structures based on finding category
  switch (finding.category.toLowerCase()) {
    case 'auth':
      return `${basePrompt}
The authentication issue can be fixed by implementing a proper session timeout handler that:

1. Intercepts 401 responses from the API
2. Displays user-friendly messages on session expiration
3. Redirects users to the login page with return path
4. Monitors user activity to prevent unexpected logouts

### Example Implementation

\`\`\`tsx
// Add this to src/components/auth/SessionTimeoutHandler.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function SessionTimeoutHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Intercept API 401 errors
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      if (response.status === 401 && location[0] !== '/auth') {
        // Handle session timeout
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "warning",
        });
        
        // Redirect to login with return path
        navigate("/auth", {
          state: { returnTo: location[0] }
        });
      }
      
      return response;
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, [location, navigate, toast]);
  
  return null; // This is a background component with no UI
}
\`\`\`

Then add this component to your \`App.tsx\`:

\`\`\`tsx
function App() {
  return (
    <>
      <SessionTimeoutHandler />
      <Router />
    </>
  );
}
\`\`\`

### Testing Steps:
1. Log in to the application
2. Wait for the session to expire (or manually expire it)
3. Perform an action that triggers an API call
4. Verify you're redirected to the login page with a friendly message
5. Confirm you can log in again and return to your previous location`;

    case 'ui':
    case 'responsive':
      return `${basePrompt}
The responsive design issue can be fixed by updating the component to use:

1. Mobile-first design principles
2. Flexible layouts that adapt to different screen sizes
3. Proper touch targets for mobile users
4. Media queries for specific breakpoint adjustments

### Example Implementation

\`\`\`tsx
// Update your component to be responsive
import { cn } from '@/lib/utils';

function ResponsiveComponent({ children, className }) {
  return (
    <div className={cn(
      // Base styles for all devices
      "w-full p-4",
      // Tablet adjustments
      "sm:p-6",
      // Desktop adjustments
      "lg:p-8",
      // Custom class
      className
    )}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}
\`\`\`

Add these styles to your global CSS:

\`\`\`css
/* Small mobile devices (iPhone SE, etc.) */
@media (max-width: 375px) {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Ensure touch targets are accessible */
@media (max-width: 640px) {
  button, a, [role="button"] {
    min-height: 44px;
  }
}
\`\`\`

### Testing Steps:
1. Open the page on various device sizes (320px, 375px, 768px, 1024px)
2. Verify layout adjusts appropriately without overflow
3. Confirm touch targets are at least 44px × 44px on mobile
4. Check text readability and image scaling
5. Verify no horizontal scrolling occurs on mobile`;

    case 'browser':
    case 'safari':
      return `${basePrompt}
The cross-browser compatibility issue can be fixed by:

1. Using browser-agnostic APIs and techniques
2. Adding specific polyfills or workarounds for problematic browsers
3. Implementing proper error handling for browser differences
4. Testing across multiple browsers during development

### Example Implementation

For image upload preview in Safari:

\`\`\`tsx
// Improve image upload to work across browsers
function handleImageUpload(file) {
  // Clear previous preview
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  
  // Use FileReader for consistent cross-browser behavior
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const result = e.target?.result as string;
    setPreviewUrl(result);
  };
  
  reader.onerror = () => {
    setError("Failed to preview image");
  };
  
  // Read as data URL for consistent behavior
  reader.readAsDataURL(file);
}
\`\`\`

### Testing Steps:
1. Test the functionality in Chrome, Firefox, Safari, and Edge
2. Verify file uploads work consistently across browsers
3. Confirm image previews render correctly in all browsers
4. Check that error handling works properly for all cases
5. Verify performance is acceptable across all platforms`;

    case 'performance':
      return `${basePrompt}
The performance issue can be fixed by:

1. Implementing proper data virtualization
2. Adding pagination for large datasets
3. Optimizing rendering with memoization
4. Using efficient state management

### Example Implementation

\`\`\`tsx
// Optimize large data rendering with virtualization
import { useVirtualizer } from '@tanstack/react-virtual';
import { memo } from 'react';

// Memoize row component to prevent unnecessary re-renders
const MemoizedRow = memo(function Row({ item }) {
  return (
    <div className="py-2 px-4 border-b">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  );
});

function VirtualizedList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
  });
  
  return (
    <div 
      ref={parentRef}
      className="h-[500px] overflow-auto"
    >
      <div
        style={{
          height: \`\${virtualizer.getTotalSize()}px\`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: \`translateY(\${virtualItem.start}px)\`,
            }}
          >
            <MemoizedRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### Testing Steps:
1. Load the component with a large dataset (1000+ items)
2. Measure initial render time before and after changes
3. Scroll rapidly through the list to test smoothness
4. Monitor memory usage during extended scrolling
5. Verify CPU usage remains reasonable during interaction`;

    default:
      return `${basePrompt}
This issue can be fixed by:

1. Following best practices for this type of component
2. Implementing proper error handling
3. Adding comprehensive testing
4. Documenting the solution

### Example Implementation

\`\`\`tsx
// Example implementation would go here based on the specific issue
\`\`\`

### Testing Steps:
1. Implement the fix as described
2. Test the functionality in various scenarios
3. Verify the issue no longer occurs
4. Document the changes made
5. Add tests to prevent regression`;
  }
}

/**
 * Generates a comprehensive bug report with fix prompts from test results
 */
export function generateBugReportWithPrompts(
  testRun: TestRun,
  findings: BugFinding[]
): BugReport {
  // Calculate severity statistics
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;
  
  // Determine overall pass/fail status based on severity
  const hasBlocker = criticalCount > 0;
  const status = hasBlocker ? 'FAIL' : highCount > 2 ? 'FAIL' : 'PASS';
  
  // Add framework IDs and fix prompts to findings
  const enhancedFindings = findings.map((finding, index) => {
    const category = finding.category || 'general';
    const id = generateFrameworkId(category, index + 1);
    const fixPrompt = generateFixPrompt({ ...finding, id });
    
    return {
      ...finding,
      id,
      fixPrompt
    };
  });
  
  // Sort findings by severity
  const sortedFindings = [...enhancedFindings].sort((a, b) => {
    const severityOrder: Record<SeverityLevel, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3
    };
    
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
  
  // Create the bug report
  const report: BugReport = {
    id: `TEST-RUN-${testRun.id}`,
    title: `Bounce Test Report: ${testRun.name}`,
    timestamp: Date.now(),
    formattedDate: formatDate(new Date()),
    testRun: {
      ...testRun,
      environment: getBrowserInfo() || 'Node.js Environment'
    },
    findings: sortedFindings,
    statistics: {
      total: findings.length,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount
    },
    status,
    summary: generateReportSummary(status, sortedFindings, testRun)
  };
  
  return report;
}

/**
 * Generates a summary for the bug report
 */
function generateReportSummary(
  status: string,
  findings: BugFinding[],
  testRun: TestRun
): string {
  if (findings.length === 0) {
    return `No issues found during test run "${testRun.name}" on ${formatDate(new Date(testRun.startTime))}. All tests passed successfully.`;
  }
  
  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const highFindings = findings.filter(f => f.severity === 'high');
  
  if (status === 'FAIL') {
    const criticalSummary = criticalFindings.length > 0
      ? `${criticalFindings.length} critical issue${criticalFindings.length > 1 ? 's' : ''} found`
      : '';
    
    const highSummary = highFindings.length > 0
      ? `${highFindings.length} high-severity issue${highFindings.length > 1 ? 's' : ''} found`
      : '';
    
    const summaryParts = [criticalSummary, highSummary].filter(Boolean);
    
    return `Test run "${testRun.name}" FAILED on ${formatDate(new Date(testRun.startTime))}. ${summaryParts.join(' and ')}. These issues must be addressed before deployment.`;
  }
  
  return `Test run "${testRun.name}" PASSED on ${formatDate(new Date(testRun.startTime))} with ${findings.length} non-critical issue${findings.length > 1 ? 's' : ''} found. Deployment can proceed, but issues should be addressed in future sprints.`;
}

/**
 * Formats the bug report as markdown
 */
export function formatBugReportAsMarkdown(report: BugReport): string {
  const { title, formattedDate, testRun, findings, statistics, status, summary } = report;
  
  // Color indicators based on severity
  const severityIndicator: Record<SeverityLevel, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  };
  
  // Format the header
  let markdown = `# ${title}\n\n`;
  
  // Overall status with emoji
  markdown += `**Status: ${status === 'PASS' ? '✅ PASS' : '❌ FAIL'}**\n\n`;
  
  // Summary
  markdown += `## Summary\n\n${summary}\n\n`;
  
  // Test run information
  markdown += `## Test Run Information\n\n`;
  markdown += `- **Run ID:** ${testRun.id}\n`;
  markdown += `- **Name:** ${testRun.name}\n`;
  markdown += `- **Date:** ${formattedDate}\n`;
  markdown += `- **Duration:** ${Math.round((testRun.endTime - testRun.startTime) / 1000)} seconds\n`;
  markdown += `- **Environment:** ${testRun.environment}\n\n`;
  
  // Statistics section
  markdown += `## Statistics\n\n`;
  markdown += `- **Total Issues:** ${statistics.total}\n`;
  markdown += `- **Critical Issues:** ${statistics.critical}\n`;
  markdown += `- **High-Severity Issues:** ${statistics.high}\n`;
  markdown += `- **Medium-Severity Issues:** ${statistics.medium}\n`;
  markdown += `- **Low-Severity Issues:** ${statistics.low}\n\n`;
  
  // Findings section
  if (findings.length > 0) {
    markdown += `## Findings\n\n`;
    
    findings.forEach((finding, index) => {
      markdown += `### ${index + 1}. ${severityIndicator[finding.severity]} ${finding.title} (${finding.id})\n\n`;
      markdown += `**Severity:** ${finding.severity.toUpperCase()}\n\n`;
      markdown += `**Category:** ${finding.category}\n\n`;
      markdown += `**Description:**\n${finding.description}\n\n`;
      
      if (finding.steps) {
        markdown += `**Steps to Reproduce:**\n\n`;
        finding.steps.forEach((step, stepIndex) => {
          markdown += `${stepIndex + 1}. ${step}\n`;
        });
        markdown += '\n';
      }
      
      if (finding.expectedResult) {
        markdown += `**Expected Result:**\n${finding.expectedResult}\n\n`;
      }
      
      if (finding.actualResult) {
        markdown += `**Actual Result:**\n${finding.actualResult}\n\n`;
      }
      
      if (finding.fixPrompt) {
        markdown += `${finding.fixPrompt}\n\n`;
      }
      
      markdown += `---\n\n`;
    });
  }
  
  // Recommendations section
  markdown += `## Recommendations\n\n`;
  
  if (status === 'FAIL') {
    if (statistics.critical > 0) {
      markdown += `- **CRITICAL:** Address the ${statistics.critical} critical issue${statistics.critical > 1 ? 's' : ''} before proceeding with deployment\n`;
    }
    
    if (statistics.high > 0) {
      markdown += `- **REQUIRED:** Fix the ${statistics.high} high-severity issue${statistics.high > 1 ? 's' : ''} to ensure proper application functionality\n`;
    }
  }
  
  if (statistics.medium > 0) {
    markdown += `- **RECOMMENDED:** Schedule fixes for the ${statistics.medium} medium-severity issue${statistics.medium > 1 ? 's' : ''} in the next sprint\n`;
  }
  
  if (statistics.low > 0) {
    markdown += `- **OPTIONAL:** Address the ${statistics.low} low-severity issue${statistics.low > 1 ? 's' : ''} to improve overall quality\n`;
  }
  
  // Footer
  markdown += `\n---\n\n`;
  markdown += `*This report was automatically generated by Bounce Testing System. Generated on ${formattedDate}*\n`;
  
  return markdown;
}

/**
 * Use this function to generate a complete bug report with actionable fix prompts
 */
export function createBugReportWithFixPrompts(
  testRun: TestRun,
  findings: BugFinding[]
): string {
  // Generate the complete bug report with fix prompts
  const report = generateBugReportWithPrompts(testRun, findings);
  
  // Format the report as markdown
  return formatBugReportAsMarkdown(report);
}