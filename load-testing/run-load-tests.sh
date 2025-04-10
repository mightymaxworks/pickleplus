#!/bin/bash
# PKL-278651-PERF-0001-LOAD
# Load Testing Execution Script

# Create results directory
mkdir -p ./results

# Set environment variables
export NODE_ENV="local"  # Use local environment by default
export TEST_TYPE="all"   # Run all tests by default

# Parse command line arguments
while [ "$1" != "" ]; do
  case $1 in
    -e | --env )         shift
                         export NODE_ENV=$1
                         ;;
    -t | --test-type )   shift
                         export TEST_TYPE=$1
                         ;;
    -h | --help )        echo "Usage: ./run-load-tests.sh [options]"
                         echo "Options:"
                         echo "  -e, --env ENV          Set environment (local, staging, production)"
                         echo "  -t, --test-type TYPE   Set test type (all, baseline, load, stress, spike, endurance)"
                         echo "  -h, --help             Show this help message"
                         exit
                         ;;
    * )                  echo "Unknown option: $1"
                         echo "Use --help for usage information"
                         exit 1
  esac
  shift
done

echo "=============================================="
echo "Pickle+ Load Testing Framework"
echo "PKL-278651-PERF-0001-LOAD"
echo "=============================================="
echo "Environment: $NODE_ENV"
echo "Test Type: $TEST_TYPE"
echo "Start Time: $(date)"
echo "=============================================="

# Function to run a specific test type
run_test() {
  local test_type=$1
  local scenario=$2
  local output_file="./results/${test_type}_${scenario}_$(date +%Y%m%d_%H%M%S).json"
  
  echo "Running $test_type test for $scenario scenario..."
  
  # Set K6_ITERATIONS and K6_VUS based on test type
  case $test_type in
    baseline)
      export K6_ITERATIONS=100
      export K6_VUS=50
      ;;
    load)
      export K6_ITERATIONS=500
      export K6_VUS=200
      ;;
    stress)
      export K6_ITERATIONS=1000
      export K6_VUS=500
      ;;
    spike)
      export K6_ITERATIONS=200
      export K6_VUS=1000
      ;;
    endurance)
      export K6_ITERATIONS=2000
      export K6_VUS=100
      ;;
    *)
      # Use default settings
      export K6_ITERATIONS=100
      export K6_VUS=50
      ;;
  esac
  
  # Run the test using k6
  k6 run --out json=$output_file ./scenarios/$scenario.js
  
  echo "Test completed. Results saved to $output_file"
  echo "---------------------------------------------"
}

# Main execution

case $TEST_TYPE in
  all)
    # Run the main orchestration script
    echo "Running comprehensive load test with all scenarios..."
    k6 run --out json=./results/full_load_test_$(date +%Y%m%d_%H%M%S).json ./main.js
    ;;
    
  baseline|load|stress|spike|endurance)
    # Run individual scenarios with the specified test type
    for scenario in authentication golden-ticket; do  # Add more scenarios as they are implemented
      if [ -f "./scenarios/$scenario.js" ]; then
        run_test $TEST_TYPE $scenario
      else
        echo "Scenario file not found: ./scenarios/$scenario.js"
      fi
    done
    ;;
    
  *)
    echo "Unknown test type: $TEST_TYPE"
    echo "Valid types: all, baseline, load, stress, spike, endurance"
    exit 1
    ;;
esac

echo "=============================================="
echo "Load Testing Completed"
echo "End Time: $(date)"
echo "Results available in ./results directory"
echo "=============================================="

# Generate summary report
echo "Generating summary report..."
python3 ./lib/generate_report.py ./results

echo "Done! Check ./results/summary_report.html for detailed results."