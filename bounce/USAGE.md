# Bounce CI/CD Command-Line Usage Guide

## Installation

Before using Bounce CI/CD, install the required dependencies:

```bash
bash bounce/setup.sh
```

## Basic Commands

### Run All Tests

```bash
# With default options
npx tsx bounce/cli.ts run

# With specific options
npx tsx bounce/cli.ts run --suite all --browsers chrome --output markdown --verbose
```

### Run Specific Test Suite

```bash
# Run community test suite
npx tsx bounce/cli.ts run --suite community

# Run API test suite
npx tsx bounce/cli.ts run --suite api
```

### Initialize Test Suite

```bash
npx tsx bounce/cli.ts init
```

## CI/CD Process

Run the full CI/CD process:

```bash
npx tsx bounce/ci/run-ci.ts
```

Options:
- `--skip-tests`: Skip running tests
- `--skip-build`: Skip building the application
- `--skip-deploy`: Skip deployment steps
- `--ci-mode`: Run in CI mode (fail on critical findings)
- `--test-suite <name>`: Test suite to run (default: "all")
- `--report-format <format>`: Report format (markdown, html, text)
- `--browser <name>`: Browser to test with (default: "chrome")

Example:
```bash
# Skip tests, only build and prepare for deployment
npx tsx bounce/ci/run-ci.ts --skip-tests

# Run in CI mode with specific test suite and browser
npx tsx bounce/ci/run-ci.ts --ci-mode --test-suite api --browser firefox
```

## Creating Test Suites

Test suites are defined in JSON files in the `bounce/tests` directory.

Basic structure:
```json
{
  "name": "example",
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

Available actions:
- `navigate`: Navigate to a URL
- `click`: Click on an element
- `type`: Type text into an element
- `assertElementExists`: Assert that an element exists
- `assertElementCount`: Assert the count of elements
- `assertText`: Assert text content
- `wait`: Wait for a specified duration
- `apiRequest`: Make an API request
- `assertStatus`: Assert HTTP status code
- `assertResponseJsonProperty`: Assert JSON property in response
- `assertResponseJsonLength`: Assert JSON array length in response

## Viewing Reports

Reports are generated in the `reports` directory. View the latest report:

```bash
# Use the helper script to view the latest report
node -e "const path=require('path');const fs=require('fs');const dir=path.join('reports');const files=fs.readdirSync(dir).filter(f=>f.endsWith('.md')).map(f=>path.join(dir,f));if(files.length>0){console.log('Latest report:',files[files.length-1]);console.log(fs.readFileSync(files[files.length-1],'utf8'))}else{console.log('No reports found')}"
```

## Troubleshooting

1. **Missing dependencies**:
   ```bash
   bash bounce/setup.sh
   ```

2. **Test failures**:
   - Check the generated report for details on failures
   - Look in `reports/evidence` for screenshots and logs

3. **CI process errors**:
   - Check the CI report in `reports/ci`
   - Examine each stage's output for specific errors