#!/bin/bash
# PKL-278651-PERF-0001-LOAD
# Golden Ticket Load Test Runner for Initial Testing

echo "📊 Running a Golden Ticket load test with minimal impact on the system"
echo "=========================================================="

# Create results directory
mkdir -p ./load-testing/results

# Set environment variables for a minimal test
export PICKLE_APP_URL="https://7c53293f-df0f-44d1-aa13-74da41f82777-00-5jeol01lwwzz.worf.replit.dev"
export TEST_USERS=2
export TEST_ITERATIONS=5

# Run a very small test to check connectivity and golden ticket features
echo "🧪 Testing Golden Ticket features with ${TEST_USERS} virtual users and ${TEST_ITERATIONS} iterations..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="./load-testing/results/golden_ticket_test_${TIMESTAMP}.json"

# Run the test with minimal parameters
./k6 run \
  --vus $TEST_USERS \
  --iterations $TEST_ITERATIONS \
  --out json=$OUTPUT_FILE \
  ./load-testing/golden-ticket.js

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
  # Parse for the http_req_duration metrics
  echo "Average response time: $(grep -o '\"http_req_duration\":{[^}]*\"avg\":[^,]*' $OUTPUT_FILE | head -1 | sed 's/.*\"avg\"://' || echo "Not available") ms"
  echo "Success rate: $(grep -o '\"http_reqs\":{[^}]*\"rate\":[^,]*' $OUTPUT_FILE | head -1 | sed 's/.*\"rate\"://' || echo "Not available") requests/sec"
  echo "Error rate: $(grep -o '\"http_req_failed\":{[^}]*\"rate\":[^,]*' $OUTPUT_FILE | head -1 | sed 's/.*\"rate\"://' || echo "Not available")"
  
  # Golden ticket specific metrics
  echo "Golden Ticket response time (p95): $(grep -o '\"http_req_duration{feature:golden_ticket}\":{[^}]*\"p\\(95\\)\":[^,]*' $OUTPUT_FILE | head -1 | sed 's/.*\"p(95)\"://' || echo "Not available") ms"
else
  echo "No results file found."
fi