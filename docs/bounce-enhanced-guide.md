# Bounce Enhanced Testing System Guide

## Overview

The Bounce Enhanced Testing System provides comprehensive automated testing with actionable fix prompts for Pickle+. This guide explains how to use the enhanced system to not only identify issues but also receive guidance on how to fix them.

## Key Features

1. **Automated Testing**: Run tests against both local and production environments
2. **Bug Detection**: Identify issues across the platform organized by severity
3. **Framework 5.2 IDs**: Standardized issue tracking with PKL-278651-AREA-XXXX-FIX format
4. **Fix Prompts**: Actionable recommendations with code examples for resolving issues
5. **CI/CD Integration**: Prevent deployment of code with critical issues
6. **Trend Analysis**: Track testing progress over time

## Available Scripts

### 1. Run Local Tests
```bash
npx tsx run-local-tests.ts
```
Tests your local development environment (http://localhost:3000).

### 2. Run Production Tests
```bash
npx tsx run-production-tests.ts
```
Tests the production environment and generates detailed reports.

### 3. Run Tests with Fix Prompts
```bash
npx tsx run-with-fix-prompts.ts
```
Generates enhanced reports with actionable fix recommendations.

### 4. CI/CD Integration
```bash
npx tsx bounce/ci-cd-integration.ts
```
Performs testing as part of CI/CD pipeline, returning appropriate exit codes.

## Fix Prompts Explained

The enhanced bug reports now include fix prompts that provide:

1. **Action Items**: Specific steps to take to resolve the issue
2. **Code Examples**: Sample code showing how to implement the fix
3. **Testing Steps**: How to verify that the fix works properly

Each fix prompt is tailored to the specific type of issue (authentication, UI, responsiveness, etc.) and provides guidance based on best practices.

## Report Types

Bounce generates several types of reports:

1. **Standard Bug Reports** (`bug-report-*.md`): Detailed findings by severity
2. **Fix Prompt Reports** (`bug-report-with-prompts-*.md`): Bug reports with actionable fix recommendations
3. **CI/CD Summaries** (`cicd-summary-*.md`): Concise reports for CI/CD pipelines

## Understanding Severity Levels

- **CRITICAL**: Issues that must be fixed before deployment (authentication failures, data loss, security vulnerabilities)
- **HIGH**: Issues that significantly impact user experience (layout breaking on mobile, unusable features)
- **MODERATE**: Issues that affect user experience but don't prevent core functionality
- **LOW**: Minor issues, inconsistencies, or cosmetic problems

## GitHub Actions Integration

Bounce is integrated with GitHub Actions via `.github/workflows/bounce-cicd.yml`, which:

1. Runs automatically on push to main branch or pull requests
2. Sets up a testing environment with PostgreSQL
3. Executes Bounce tests
4. Fails the workflow if critical issues are found
5. Uploads test reports as artifacts

## Example Fix Implementation

Here's how to use the fix prompts to resolve an issue:

1. Review the issue details and understand the problem
2. Check the Action Items for specific steps to take
3. Use the provided Code Example as a starting point
4. Implement the fix following best practices
5. Test the fix using the suggested Testing Steps
6. Run Bounce tests again to verify the issue is resolved

## Customizing Fix Prompts

You can customize the fix prompts by modifying `bounce/reporting/fix-prompts.ts`. This file contains strategies for generating actionable recommendations based on the issue type.

## Conclusion

The Bounce Enhanced Testing System provides not just bug detection but also guidance on how to fix issues. By following the fix prompts, you can resolve problems efficiently and maintain high code quality across the Pickle+ platform.

For more specific information on CI/CD integration, see `docs/bounce-cicd-guide.md`.