# Bounce CI/CD Integration Guide

This guide explains how to use the Bounce automated testing system as part of a Continuous Integration/Continuous Deployment (CI/CD) pipeline for Pickle+.

## Overview

Bounce is an automated testing system that helps ensure application quality by:
- Automatically detecting bugs and issues across the platform
- Generating detailed reports with Framework 5.2 IDs and severity levels
- Tracking progress over time with trend analysis
- Integrating with CI/CD systems to prevent deployment of critical issues

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Required environment variables:
  - `DATABASE_URL`: Connection string for PostgreSQL
  - `SESSION_SECRET`: Secret for session management

## Available Scripts

### Manual Test Runners

1. **Local Development Testing**
   ```bash
   npx tsx run-local-tests.ts
   ```
   This script runs Bounce against your local development environment (http://localhost:3000).

2. **Production Environment Testing**
   ```bash
   npx tsx run-production-tests.ts
   ```
   This script tests the deployed production environment and generates a comprehensive report.

3. **CI/CD Pipeline Testing**
   ```bash
   npx tsx bounce/ci-cd-integration.ts
   ```
   This script is designed to be run in CI/CD pipelines and returns appropriate exit codes.

### Core Modules

- **bounce/production-run.ts**: Runs tests against the production environment
- **bounce/ci-cd-integration.ts**: Integrates testing with CI/CD pipelines
- **bounce/reporting/bug-report-generator.ts**: Generates formatted bug reports
- **bounce/simple-run.ts**: Runs a simple test with mock data

## GitHub Actions Integration

A GitHub Actions workflow is already set up in `.github/workflows/bounce-cicd.yml`. This workflow:

1. Runs on push to main branch, pull requests, or manual trigger
2. Sets up Node.js and PostgreSQL
3. Runs Bounce tests against the specified environment
4. Uploads test reports as artifacts
5. Fails the build if critical issues are detected
6. Conditionally proceeds with deployment if tests pass

## Interpreting Reports

Bounce generates two types of reports:

1. **Full Bug Reports** (`reports/bug-report-*.md`)
   - Comprehensive details of all findings
   - Test run information
   - Categorized findings by severity
   - Framework 5.2 IDs
   - Steps to reproduce
   - Affected URLs

2. **CI/CD Summaries** (`reports/cicd-summary-*.md`)
   - Quick summary of findings by severity
   - Pass/fail recommendation for CI/CD

## Severity Levels

The Bounce system categorizes findings into four severity levels:

- **CRITICAL**: Serious issues that must be fixed before deployment
- **HIGH**: Important issues that should be addressed soon
- **MODERATE/MEDIUM**: Issues that should be tracked and fixed in upcoming sprints
- **LOW/INFO**: Minor issues or suggestions for improvement

## CI/CD Configuration

The CI/CD integration uses these default settings:

- Tests fail if ANY critical issues are found
- Tests fail if MORE THAN 3 high-priority issues are found
- All other issues are reported but don't block deployment

You can customize these settings in the `runCICDTests` function in `bounce/ci-cd-integration.ts`.

## Customizing Tests

You can customize which tests run by modifying the test suites in `bounce/tests/`.

## Troubleshooting

If you encounter issues with the Bounce CI/CD integration:

1. Check that the database contains the required tables (run `npx tsx create-bounce-tables.ts`)
2. Verify that the application is running and accessible
3. Ensure all environment variables are correctly set
4. Check the logs for specific error messages

## Framework 5.2 ID Format

All findings use the Framework 5.2 ID format:
`PKL-278651-{AREA}-{NUMBER}-{TYPE}`

For example: `PKL-278651-AUTHENTICATION-0011-FIX`