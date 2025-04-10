#!/bin/bash
# Pickle+ Load Testing Runner
# PKL-278651-PERF-0001-LOAD

# Create results directory
mkdir -p ./load-testing/results

# Determine the environment
ENV="local"
PORT=$(ps aux | grep 'node.*index.ts' | grep -v grep | awk '{print $2}' | xargs -I{} lsof -p {} -a -i TCP | grep LISTEN | awk '{print $9}' | cut -d: -f2)

if [ -z "$PORT" ]; then
  echo "⚠️ Could not determine application port. Using default 3000."
  PORT=3000
else
  echo "📡 Detected application running on port: $PORT"
fi

# Set environment variables for the test
export PICKLE_APP_URL="http://localhost:$PORT"
export TEST_TYPE=${1:-baseline}
export TEST_DURATION=${2:-30s}
export TEST_USERS=${3:-10}

# Update the environment.js file to point to the correct URL
TMP_ENV=$(cat ./load-testing/config/environment.js)
echo "$TMP_ENV" | sed "s|http://localhost:3000|$PICKLE_APP_URL|g" > ./load-testing/config/environment.js.tmp
mv ./load-testing/config/environment.js.tmp ./load-testing/config/environment.js

echo "=============================================="
echo "🧪 Pickle+ Load Testing Framework"
echo "📋 PKL-278651-PERF-0001-LOAD"
echo "=============================================="
echo "🌐 Environment: $ENV ($PICKLE_APP_URL)"
echo "📊 Test Type: $TEST_TYPE"
echo "⏱️ Duration: $TEST_DURATION"
echo "👥 Virtual Users: $TEST_USERS"
echo "🕒 Start Time: $(date)"
echo "=============================================="

# Ensure the app is running
curl -s $PICKLE_APP_URL/api/health > /dev/null
if [ $? -ne 0 ]; then
  echo "❌ Application is not running at $PICKLE_APP_URL"
  echo "Please ensure your application is started before running tests."
  exit 1
fi

# Create test user if needed
echo "👤 Checking test users..."
# TODO: Add code to create test users if they don't exist

# Decide which scenario to run
case $TEST_TYPE in
  auth)
    SCENARIO="authentication"
    ;;
  golden)
    SCENARIO="golden-ticket"
    ;;
  all)
    SCENARIO="main"
    ;;
  *)
    SCENARIO="authentication"
    ;;
esac

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="./load-testing/results/${TEST_TYPE}_${TIMESTAMP}.json"

echo "🚀 Running $TEST_TYPE test for $SCENARIO scenario..."
echo "⏳ Please wait while the test runs..."

# Run the test with controlled parameters
./k6 run \
  --vus $TEST_USERS \
  --duration $TEST_DURATION \
  --out json=$OUTPUT_FILE \
  ./load-testing/${SCENARIO}.js

TEST_EXIT=$?

echo "=============================================="
if [ $TEST_EXIT -eq 0 ]; then
  echo "✅ Load testing completed successfully!"
else
  echo "❌ Load testing failed with exit code: $TEST_EXIT"
fi
echo "📝 Results saved to: $OUTPUT_FILE"
echo "🕒 End Time: $(date)"
echo "=============================================="

# Generate a simple summary report
echo "📊 Summary:"
echo "---------------------------------------------"
cat $OUTPUT_FILE | grep -o '"http_req_duration":{[^}]*}' | sed 's/"http_req_duration":/Response Times:/g' | sed 's/{/\n/g' | sed 's/}/\n/g' | sed 's/,/\n/g' | sed 's/"//g' | grep -v '^$'
echo "---------------------------------------------"
cat $OUTPUT_FILE | grep -o '"http_req_failed":{[^}]*}' | sed 's/"http_req_failed":/Error Rate:/g' | sed 's/{/\n/g' | sed 's/}/\n/g' | sed 's/,/\n/g' | sed 's/"//g' | grep -v '^$'
echo "---------------------------------------------"
cat $OUTPUT_FILE | grep -o '"vus":{[^}]*}' | sed 's/"vus":/Virtual Users:/g' | sed 's/{/\n/g' | sed 's/}/\n/g' | sed 's/,/\n/g' | sed 's/"//g' | grep -v '^$'
echo "---------------------------------------------"

echo "Use this data to identify performance bottlenecks before launch."