# Bounce Enhanced Test Framework Guide

## Introduction

Bounce is a comprehensive automated testing and CI/CD integration framework designed for Pickle+. It provides actionable bug reports with fix recommendations, integrates with GitHub Actions for CI/CD pipelines, and supports cross-browser testing.

## Key Features

1. **Framework 5.2 ID Codes**: Each bug finding receives a unique ID (e.g., PKL-278651-AUTH-0001-TIMEOUT)
2. **Actionable Fix Prompts**: Bug reports include code examples and implementation guidance
3. **Severity-Based Decisions**: CI/CD process uses severity thresholds for pass/fail decisions
4. **Comprehensive Reporting**: Detailed test reports with statistics and deployment recommendations
5. **GitHub Integration**: Automates testing in pull requests and deployment workflows

## Directory Structure

```
bounce/
├── fixes/                     # Solution implementations for detected issues
│   ├── PKL-278651-AUTH-0001-TIMEOUT/
│   ├── PKL-278651-COMM-0002-MOBILE/
│   ├── PKL-278651-TOURN-0003-OVERFLOW/
│   └── PKL-278651-PROF-0004-SAFARI/
├── reporting/                 # Reporting modules and templates
│   └── bug-report-generator-with-prompts.ts
├── types/                     # TypeScript type definitions
│   └── index.ts
├── utils/                     # Utility functions
│   ├── browser-detection.ts
│   └── date-utils.ts
├── ci-cd-integration.ts       # CI/CD pipeline integration
└── production-run.ts          # Test execution engine
```

## Setup and Configuration

To run Bounce tests, you need:

1. A running Pickle+ instance (local or deployed)
2. Node.js environment with TypeScript
3. Optional: Playwright for browser testing (falls back to mock mode if unavailable)

## Running Tests

### Basic Test Run

To run tests with default settings:

```bash
# Run with fix recommendations
npx tsx run-with-fix-prompts.ts
```

### CI/CD Integration

Bounce integrates with GitHub Actions using the provided workflow:

```yaml
# .github/workflows/bounce-cicd.yml
name: Bounce CI/CD Testing

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]
  workflow_dispatch:

jobs:
  bounce-tests:
    name: Run Bounce Tests
    runs-on: ubuntu-latest
    
    steps:
      # Setup steps...
      
      - name: Run Bounce tests
        run: npx tsx run-with-fix-prompts.ts
        env:
          CI: true
```

## Bug Reports

Bounce generates comprehensive bug reports with:

- Framework 5.2 ID codes (e.g., PKL-278651-AUTH-0001-TIMEOUT)
- Severity classification (critical, high, medium, low)
- Detailed reproduction steps
- Fix recommendations with code examples
- Testing steps for verification

Example report entry:
```markdown
### 1. 🔴 Session timeout not handled properly (PKL-278651-AUTH-0001-TIMEOUT)

**Severity:** CRITICAL

**Category:** auth

**Description:**
When a user session expires, the application shows a generic error instead of redirecting to the login page with a friendly message.

**Steps to Reproduce:**
1. Log in to the application
2. Wait for the session to expire (or manually expire it)
3. Perform an action that triggers an API call
4. Observe the error behavior

**Expected Result:**
User should be redirected to the login page with a friendly message about session expiration

**Actual Result:**
Application displays a generic error and stays on the current page

## Fix Recommendation for PKL-278651-AUTH-0001-TIMEOUT

The authentication issue can be fixed by implementing a proper session timeout handler that:

1. Intercepts 401 responses from the API
2. Displays user-friendly messages on session expiration
3. Redirects users to the login page with return path
4. Monitors user activity to prevent unexpected logouts

### Example Implementation

```tsx
// Add this to src/components/auth/SessionTimeoutHandler.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function SessionTimeoutHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Implementation details...
}
```
```

## Fix Implementations

Bounce provides complete fix implementations in the `bounce/fixes` directory, organized by Framework ID:

1. **PKL-278651-AUTH-0001-TIMEOUT**: Session timeout handling
2. **PKL-278651-COMM-0002-MOBILE**: Responsive community page
3. **PKL-278651-TOURN-0003-OVERFLOW**: Tournament bracket scrolling
4. **PKL-278651-PROF-0004-SAFARI**: Cross-browser image upload

These solutions can be directly integrated into the codebase to fix the detected issues.

## Best Practices

1. **Run tests locally before pushing**: Detect issues early to prevent CI pipeline failures
2. **Prioritize critical issues**: Always fix critical issues before deploying
3. **Integrate fixes properly**: Use the provided fix implementations as guidance, adapting to your codebase
4. **Update test coverage**: Add tests for fixed issues to prevent regression
5. **Review trends over time**: Monitor bug statistics to evaluate quality improvement

## Troubleshooting

- **Playwright not available**: Bounce will fall back to mock browser mode
- **Test failures**: Check the reports for detailed error information
- **CI integration issues**: Ensure GitHub Actions workflow has proper permissions

For support, contact the Framework 5.2 team.