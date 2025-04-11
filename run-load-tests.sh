#!/bin/bash
# PKL-278651-PERF-0001-LOAD
# Comprehensive Load Testing Runner

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Pickle+ Comprehensive Load Testing Suite${NC}"
echo -e "${BLUE}==================================================${NC}"

# Create results directory
mkdir -p ./load-testing/results

# Set default environment variables for testing
export TEST_TYPE="${TEST_TYPE:-baseline}"
export TEST_USERS="${TEST_USERS:-5}"
export TEST_ITERATIONS="${TEST_ITERATIONS:-10}"
export TEST_DURATION="${TEST_DURATION:-30s}"
export PICKLE_APP_URL="${PICKLE_APP_URL:-https://7c53293f-df0f-44d1-aa13-74da41f82777-00-5jeol01lwwzz.worf.replit.dev}"

# Display test configuration
echo -e "${YELLOW}Test Configuration:${NC}"
echo -e "  Test type: ${TEST_TYPE}"
echo -e "  Virtual users: ${TEST_USERS}"
echo -e "  Iterations: ${TEST_ITERATIONS}" 
echo -e "  Max duration: ${TEST_DURATION}"
echo -e "  Application URL: ${PICKLE_APP_URL}"
echo ""

# Function to run a test and report results
run_test() {
    local test_name=$1
    local test_file=$2
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local output_file="./load-testing/results/${test_name}_${timestamp}.json"
    
    echo -e "${YELLOW}🧪 Running ${test_name} test...${NC}"
    
    # Run the test with configured parameters
    ./k6 run \
      --vus $TEST_USERS \
      --iterations $TEST_ITERATIONS \
      --out json=$output_file \
      $test_file
    
    local test_exit=$?
    
    echo -e "${BLUE}--------------------------------------------------${NC}"
    if [ $test_exit -eq 0 ]; then
      echo -e "${GREEN}✅ ${test_name} completed successfully!${NC}"
    else
      echo -e "${RED}❌ ${test_name} failed with exit code: ${test_exit}${NC}"
    fi
    echo -e "📝 Results saved to: ${output_file}"
    
    # Show basic results if available
    if [ -f "$output_file" ]; then
      # Parse metrics from JSON output
      echo -e "${YELLOW}Quick Summary:${NC}"
      
      # Extract metrics safely with fallbacks for missing data
      local avg_duration=$(grep -o '"http_req_duration":{[^}]*"avg":[^,]*' $output_file | head -1 | sed 's/.*"avg"://' || echo "Not available")
      local req_rate=$(grep -o '"http_reqs":{[^}]*"rate":[^,]*' $output_file | head -1 | sed 's/.*"rate"://' || echo "Not available")
      local error_rate=$(grep -o '"http_req_failed":{[^}]*"rate":[^,]*' $output_file | head -1 | sed 's/.*"rate"://' || echo "Not available")
      
      echo -e "  Average response time: ${avg_duration} ms"
      echo -e "  Request rate: ${req_rate} requests/sec"
      echo -e "  Error rate: ${error_rate}"
    else
      echo -e "${RED}No results file found.${NC}"
    fi
    
    echo ""
    return $test_exit
}

# Run authentication test
auth_result=0
run_test "Authentication" "./load-testing/authentication.js"
auth_result=$?

# Run golden ticket test
gt_result=0
run_test "GoldenTicket" "./load-testing/golden-ticket.js"
gt_result=$?

# Final summary
echo -e "${BLUE}==================================================${NC}"
echo -e "${YELLOW}📊 Load Testing Summary:${NC}"

if [ $auth_result -eq 0 ]; then
  echo -e "${GREEN}✅ Authentication tests passed${NC}"
else
  echo -e "${RED}❌ Authentication tests failed${NC}"
fi

if [ $gt_result -eq 0 ]; then
  echo -e "${GREEN}✅ Golden Ticket tests passed${NC}"
else
  echo -e "${RED}❌ Golden Ticket tests failed${NC}"
fi

# Overall status
if [[ $auth_result -eq 0 && $gt_result -eq 0 ]]; then
  echo -e "\n${GREEN}✅ All tests completed successfully!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ One or more tests failed.${NC}"
  exit 1
fi