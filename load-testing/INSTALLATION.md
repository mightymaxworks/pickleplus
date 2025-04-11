# Pickle+ Load Testing Installation Guide

This guide provides instructions for setting up and running load tests for the Pickle+ platform using the k6 load testing tool.

## Prerequisites

- Linux, macOS, or Windows with WSL
- Bash shell
- Internet connection
- Access to the Pickle+ platform deployment

## Installation Steps

### 1. Download k6

Choose one of the following methods to download k6:

#### Linux (64-bit)

```bash
# Debian/Ubuntu
curl -L https://github.com/grafana/k6/releases/download/v0.43.1/k6-v0.43.1-linux-amd64.tar.gz -o k6.tar.gz
tar xzf k6.tar.gz
cp k6-v0.43.1-linux-amd64/k6 ./k6
chmod +x ./k6

# Test installation
./k6 version
```

#### macOS

```bash
# With Homebrew
brew install k6

# Manual installation
curl -L https://github.com/grafana/k6/releases/download/v0.43.1/k6-v0.43.1-macos-amd64.zip -o k6.zip
unzip k6.zip
cp k6-v0.43.1-macos-amd64/k6 ./k6
chmod +x ./k6

# Test installation
./k6 version
```

#### Windows (using WSL)

```bash
# Download for Linux as above, or use:
curl -L https://github.com/grafana/k6/releases/download/v0.43.1/k6-v0.43.1-linux-amd64.tar.gz -o k6.tar.gz
tar xzf k6.tar.gz
cp k6-v0.43.1-linux-amd64/k6 ./k6
chmod +x ./k6
```

### 2. Set Up the Project Environment

1. Ensure the load testing scripts are in the correct location:
   - Authentication test: `./load-testing/authentication.js`
   - Golden Ticket test: `./load-testing/golden-ticket.js`
   - Configuration files in `./load-testing/config/`

2. Make the test runner scripts executable:
   ```bash
   chmod +x run-simple-test.sh
   chmod +x run-golden-ticket-test.sh
   ```

## Running Load Tests

### Authentication Flow Test

To run a minimal authentication flow test:

```bash
./run-simple-test.sh
```

This will:
1. Run the test with 2 virtual users
2. Execute 5 iterations per user
3. Save results to `./load-testing/results/`

### Golden Ticket Feature Test

To run a minimal Golden Ticket feature test:

```bash
./run-golden-ticket-test.sh
```

### Custom Test Parameters

You can customize the test runs with environment variables:

```bash
# Set custom parameters
export TEST_USERS=10        # Number of virtual users
export TEST_ITERATIONS=50   # Total iterations
export TEST_DURATION="2m"   # Maximum test duration

# Run with custom parameters
./run-simple-test.sh
```

## Test Results

Test results are saved as JSON files in the `./load-testing/results/` directory. Each file is timestamped with the date and time of the test run.

For a quick summary of the results, check the output of the test script which includes:
- Average response time
- Success rate (requests/second)
- Error rate
- p95 response times for specific endpoints

## Troubleshooting

### Authentication Failures

If the test reports authentication failures:

1. Verify the test user credentials in `load-testing/config/environment.js`
2. Check if the user exists in the database
3. Ensure the Pickle+ platform is running and accessible

### Script Execution Errors

If the test scripts fail to execute:

1. Ensure k6 is correctly installed: `./k6 version`
2. Check file permissions: `chmod +x run-simple-test.sh`
3. Verify JSON syntax in the test files

### Connection Issues

If the tests can't connect to the platform:

1. Verify the `baseUrl` in `load-testing/config/environment.js`
2. Ensure the platform is running and accessible
3. Check for network restrictions or firewall issues