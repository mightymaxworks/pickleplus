# Pickle+ Load Testing Infrastructure Installation
**PKL-278651-PERF-0001-LOAD**

This document provides instructions for setting up and using the load testing infrastructure for the Pickle+ platform.

## Prerequisites

To use this load testing framework, you will need to install:

1. **k6** - The core load testing tool
2. **Node.js** - For running helper scripts
3. **Python 3** - For report generation

## Installation Steps

### 1. Install k6

#### On macOS:
```bash
brew install k6
```

#### On Linux:
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

#### On Windows:
```bash
choco install k6
```

Or download the installer from the [k6 website](https://k6.io/docs/getting-started/installation/).

### 2. Install Python Dependencies

```bash
pip install pandas matplotlib jinja2
```

### 3. Verify Installation

Verify that k6 is installed correctly:

```bash
k6 version
```

## Configuration

Before running the load tests, you may need to configure the environment settings:

1. Edit `config/environment.js` to update:
   - Server URLs for different environments
   - Test user credentials
   - Test volume configurations

2. Edit `config/thresholds.js` to adjust performance thresholds based on your requirements.

## Running the Tests

The load testing framework can be run in several ways:

### 1. Running All Scenarios

To run a comprehensive load test with all scenarios:

```bash
cd load-testing
./run-load-tests.sh --env local --test-type all
```

### 2. Running Specific Test Types

To run a specific type of test across all scenarios:

```bash
cd load-testing
./run-load-tests.sh --env local --test-type baseline
```

Valid test types are:
- `baseline` - Minimal load to establish a baseline
- `load` - Normal expected load
- `stress` - Heavy load to test system limits
- `spike` - Sudden traffic spike
- `endurance` - Sustained load over time

### 3. Running Individual Scenarios

To run a specific scenario script directly:

```bash
cd load-testing
k6 run scenarios/authentication.js
```

## Interpreting Results

After running the tests, results will be available in the `results` directory:

1. JSON files contain raw test data
2. A summary HTML report will be generated at `results/summary_report.html`
3. Individual test metrics are stored in CSV format for further analysis

Key metrics to observe:
- Response times (p95, p99, median)
- Error rates
- Resource utilization
- Throughput (requests per second)

## Troubleshooting

Common issues and solutions:

### 1. Connection Refused

If you see "connection refused" errors:
- Verify that the Pickle+ application is running
- Check that the environment URL in `config/environment.js` is correct
- Ensure no firewalls are blocking the connection

### 2. Authentication Failures

If many authentication tests are failing:
- Verify that the test user credentials in `config/environment.js` are valid
- Check that the authentication endpoints match the actual API paths

### 3. High Error Rates

If you're seeing high error rates:
- Check the application logs for server-side errors
- Verify that the database can handle the connection load
- Consider reducing the test volume in `config/environment.js`

## Extending the Framework

To add a new test scenario:

1. Create a new script in the `scenarios` directory following the pattern of existing scenarios
2. Update `main.js` to include your new scenario
3. Add any necessary validation functions in `helpers/validators.js`
4. Update the run script to include your new scenario

## Support

For questions or issues with the load testing framework, contact the Performance Testing team.