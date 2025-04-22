# Bounce: Pickle+ Automated Testing & CI/CD Framework

## Overview
Bounce is a comprehensive automated testing and CI/CD framework developed for the Pickle+ platform. Built following Framework 5.2 principles, Bounce enables continuous testing, efficient bug finding, and streamlined deployment processes directly within the Replit ecosystem.

## Features
- **Non-destructive testing**: Run tests safely without affecting production data
- **Comprehensive test coverage**: UI, API, and performance testing
- **Detailed reporting**: Generate detailed reports in multiple formats
- **CI/CD integration**: Seamlessly run as part of CI/CD workflows
- **Evidence collection**: Automatically capture screenshots and logs for findings
- **Scheduling capabilities**: Automate test runs on custom schedules

## Dependencies
To use Bounce, you'll need to install the following dependencies:

```bash
# Run the setup script (recommended approach)
bash bounce/setup.sh
```

The setup script installs dependencies without modifying package.json, which avoids conflicts with Replit's package management system. It installs:

- playwright (browser automation)
- colors (terminal coloring)
- commander (command-line interface)
- dotenv (environment variables)

**Important**: The dependencies are installed with `--no-save` to prevent modifying package.json. If you reinstall node_modules or restart the Repl, you'll need to run the setup script again.

## Architecture
Bounce consists of several core components:

1. **Bounce Core**:
   - `bounce-identity.ts`: Handles test run tracking and user association
   - `non-destructive-tester.ts`: Ensures safe testing without modifying production data

2. **Test Runner**:
   - `test-runner.ts`: Executes automated tests defined in test suites

3. **Reporting System**:
   - `report-generator.ts`: Generates formatted reports from test findings

4. **CI/CD Integration**:
   - `cli.ts`: Command-line interface for running in CI/CD workflows
   - `run-ci.ts`: Script for executing complete CI/CD processes

5. **Test Suites & Definitions**:
   - JSON-based test suite definitions in `bounce/tests/`

## Database Schema
Bounce uses the following database tables:
- `bounce_test_runs`: Tracks test executions
- `bounce_findings`: Stores issues discovered during testing
- `bounce_evidence`: Stores evidence related to findings
- `bounce_schedules`: Configures automated test scheduling
- `bounce_interactions`: Tracks user interactions with Bounce

## Usage

### Running Tests
Run tests using the CLI:

```bash
# Install dependencies
npm install -D playwright colors commander

# Run all test suites
npx tsx bounce/cli.ts run --suite all --browsers chrome --output markdown --verbose

# Run a specific test suite
npx tsx bounce/cli.ts run --suite community --browsers chrome --output markdown --verbose
```

### CI/CD Process
Run the complete CI/CD process:

```bash
# Run CI process with all stages
npx tsx bounce/ci/run-ci.ts

# Skip certain stages
npx tsx bounce/ci/run-ci.ts --skip-tests
npx tsx bounce/ci/run-ci.ts --skip-build
npx tsx bounce/ci/run-ci.ts --skip-deploy

# Run in CI mode (fail on critical findings)
npx tsx bounce/ci/run-ci.ts --ci-mode
```

### Creating Test Suites
1. Create a new JSON file in `bounce/tests/`
2. Define your test suite following this structure:

```json
{
  "name": "example-suite",
  "tests": [
    {
      "name": "Example Test",
      "description": "Description of the test",
      "paths": ["/path-to-test"],
      "steps": [
        {
          "action": "navigate",
          "target": "/path-to-test"
        },
        {
          "action": "assertElementExists",
          "target": ".element-selector"
        }
      ]
    }
  ]
}
```

## Deployment Integration
Bounce is designed to work with Replit's deployment system:

1. Run the CI/CD process: `npx tsx bounce/ci/run-ci.ts`
2. If successful, use Replit's deployment UI with:
   - Build Command: `node build-for-deployment.js`
   - Run Command: `NODE_ENV=production node dist/index.js`

## Future Enhancements
- GitHub Actions integration for external CI/CD workflows
- Enhanced testing capabilities for mobile-specific features
- Performance analysis and benchmarking tools
- Integration with bug tracking systems

## Framework Compatibility
Developed following Framework 5.2 principles with a focus on:
- Maintainability and readability
- Extensibility for future enhancements
- Non-destructive testing methodologies
- Comprehensive reporting and traceability

## License
Proprietary - Pickle+ Internal Use Only