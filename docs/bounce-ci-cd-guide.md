# Bounce CI/CD Integration Guide

## Overview

The Bounce Testing System integrates with CI/CD pipelines to ensure that critical issues are identified before code is deployed to production. This guide explains how to use Bounce in a CI/CD context.

## CI/CD Integration

Bounce is integrated with GitHub Actions via the `.github/workflows/bounce-cicd.yml` configuration, which:

1. Runs automatically on push to the main/master branch
2. Runs automatically on pull requests to main/master
3. Can be triggered manually with a custom target URL

The workflow:
- Sets up a PostgreSQL database for test storage
- Installs Playwright for browser automation
- Runs Bounce tests against the target application
- Uploads reports and evidence as workflow artifacts
- Fails the CI/CD pipeline if critical issues are found

## How It Works

The CI/CD process:

1. **Setup**: Creates necessary directories and initializes the testing environment
2. **Test Execution**: Runs Bounce tests against the target URL
3. **Report Generation**: Creates detailed bug reports with Framework5.2 IDs
4. **Evaluation**: Determines if the build should pass or fail based on findings
5. **Artifact Storage**: Uploads test reports and evidence for later analysis

## Using Locally

To test the CI/CD integration locally before pushing:

```bash
# Create the required directories
mkdir -p bounce/data evidence reports

# Run the CI/CD tests
npx tsx bounce/ci-cd-integration.ts https://your-application-url.com
```

## Exit Codes

The CI/CD script returns specific exit codes:

- **0**: Success (no critical issues)
- **1**: Failure (critical issues found or test execution failed)

These exit codes are used by the GitHub Actions workflow to determine if the CI/CD pipeline should pass or fail.

## Configuring Test Thresholds

By default, the CI/CD pipeline fails if any critical issues are found. You can customize this behavior by modifying the `runCICDTests` function in `bounce/ci-cd-integration.ts`:

```typescript
// Example: Only fail if there are more than 2 critical issues
const shouldFail = criticalCount > 2;
```

## CI/CD Summary Report

The CI/CD summary report provides a concise overview of the test results, including:

- Basic test information (name, status, URL)
- Counts of issues by severity
- Pass/fail status with justification
- List of critical issues that need to be fixed

This report is uploaded as an artifact and can be downloaded from the GitHub Actions workflow page.

## Continuous Improvement

The Bounce CI/CD integration is designed to improve code quality over time by:

1. Preventing critical issues from reaching production
2. Providing actionable fix prompts for identified issues
3. Maintaining a historical record of testing results
4. Encouraging developers to write more robust code

## Troubleshooting

If the CI/CD workflow fails unexpectedly:

1. Check the workflow logs for error messages
2. Verify that the target URL is accessible
3. Ensure all required directories exist (bounce/data, evidence, reports)
4. Check that the DATABASE_URL is correctly configured
5. Review the uploaded reports for additional information

For more detailed information on the Bounce testing system, see `docs/bounce-enhanced-guide.md`.