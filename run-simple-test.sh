#!/bin/bash
# PKL-278651-PERF-0001-LOAD
# Simple Load Test Runner for Initial Testing

echo "📊 Running a simple load test with minimal impact on the system"
echo "=========================================================="

# Create results directory
mkdir -p ./load-testing/results

# Set environment variables for a minimal test
export PICKLE_APP_URL="https://7c53293f-df0f-44d1-aa13-74da41f82777-00-5jeol01lwwzz.worf.replit.dev"
export TEST_USERS=2
export TEST_ITERATIONS=5

# Run a very small test to check connectivity and authentication
echo "🧪 Testing authentication with ${TEST_USERS} virtual users and ${TEST_ITERATIONS} iterations..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="./load-testing/results/auth_test_${TIMESTAMP}.json"

# Run the test with minimal parameters
./k6 run \
  --vus $TEST_USERS \
  --iterations $TEST_ITERATIONS \
  --out json=$OUTPUT_FILE \
  ./load-testing/authentication.js

TEST_EXIT=$?

echo "=========================================================="
if [ $TEST_EXIT -eq 0 ]; then
  echo "✅ Load testing completed successfully!"
else
  echo "❌ Load testing failed with exit code: $TEST_EXIT"
fi
echo "📝 Results saved to: $OUTPUT_FILE"
echo "=========================================================="

# Show basic results
echo "📊 Quick Summary:"
if [ -f "$OUTPUT_FILE" ]; then
  echo "Average response time: $(cat $OUTPUT_FILE | grep -o '\"http_req_duration\":{[^}]*\"avg\":[^,]*' | sed 's/.*\"avg\"://' | head -1) ms"
  echo "Success rate: $(cat $OUTPUT_FILE | grep -o '\"http_reqs\":{[^}]*\"rate\":[^,]*' | sed 's/.*\"rate\"://' | head -1) requests/sec"
  echo "Error rate: $(cat $OUTPUT_FILE | grep -o '\"http_req_failed\":{[^}]*\"rate\":[^,]*' | sed 's/.*\"rate\"://' | head -1)"
else
  echo "No results file found."
fi