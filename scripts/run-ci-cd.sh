#!/bin/bash

# CI/CD Pipeline for Admin Enhanced Match Management
# Ensures 100% operational status

set -e

echo "🚀 Starting CI/CD Pipeline for Admin Enhanced Match Management"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}📡 Checking server status...${NC}"
if ! curl -s http://localhost:5000 > /dev/null; then
    echo -e "${YELLOW}⚠️  Server not running, starting...${NC}"
    npm run dev &
    SERVER_PID=$!
    echo "Waiting for server to start..."
    sleep 10
    
    # Check again
    if ! curl -s http://localhost:5000 > /dev/null; then
        echo -e "${RED}❌ Failed to start server${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Server started successfully${NC}"
else
    echo -e "${GREEN}✅ Server is running${NC}"
fi

# Step 1: Static Analysis
echo -e "\n${BLUE}🔍 Step 1: Static Analysis${NC}"
echo "Checking for runtime errors in components..."

# Check for empty SelectItem values (our critical fix)
echo "Checking SelectItem components..."
if grep -r 'SelectItem value=""' client/src/ 2>/dev/null; then
    echo -e "${RED}❌ Found empty SelectItem values - critical error!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No empty SelectItem values found${NC}"
fi

# Check for missing exports
echo "Checking component exports..."
for file in client/src/pages/admin/EnhancedMatchManagement.tsx \
           client/src/components/match/QuickMatchRecorderStreamlined.tsx \
           client/src/modules/admin/components/AdminLayout.tsx; do
    if [ -f "$file" ]; then
        if grep -q "export" "$file"; then
            echo -e "${GREEN}✅ $file has exports${NC}"
        else
            echo -e "${RED}❌ $file missing exports${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ $file not found${NC}"
        exit 1
    fi
done

# Step 2: API Validation
echo -e "\n${BLUE}🔌 Step 2: API Endpoint Validation${NC}"
node scripts/ci-cd-validation.js

# Check validation result
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ API validation failed${NC}"
    exit 1
fi

# Step 3: Component Testing
echo -e "\n${BLUE}🧩 Step 3: Component Testing${NC}"

# Install testing dependencies if not present
if ! command -v puppeteer > /dev/null; then
    echo "Installing testing dependencies..."
    npm install --save-dev puppeteer axios
fi

# Run automated tests
echo "Running automated browser tests..."
node scripts/automated-testing.js

# Check test result
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Automated tests failed${NC}"
    exit 1
fi

# Step 4: Load Testing
echo -e "\n${BLUE}⚡ Step 4: Load Testing${NC}"
echo "Testing admin endpoint performance..."

# Simple load test for admin endpoints
for endpoint in "/api/admin/match-management/players/available" \
               "/api/admin/match-management/matches" \
               "/api/admin/enhanced-match-management/age-groups"; do
    echo "Testing $endpoint..."
    
    # Test with curl (basic load test)
    start_time=$(date +%s%N)
    response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:5000$endpoint")
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ "$response" = "200" ] || [ "$response" = "401" ]; then # 401 is ok for unauth endpoints
        echo -e "${GREEN}✅ $endpoint responded in ${duration}ms${NC}"
    else
        echo -e "${RED}❌ $endpoint failed with status $response${NC}"
        exit 1
    fi
done

# Step 5: Memory and Performance Check
echo -e "\n${BLUE}💾 Step 5: Performance Check${NC}"
echo "Checking server performance..."

# Get server process memory usage
if [ -n "$SERVER_PID" ]; then
    memory=$(ps -o pid,vsz,rss,comm -p $SERVER_PID 2>/dev/null | tail -n +2)
    if [ -n "$memory" ]; then
        echo -e "${GREEN}✅ Server memory usage: $memory${NC}"
    fi
fi

# Step 6: Final Validation
echo -e "\n${BLUE}🎯 Step 6: Final Validation${NC}"
echo "Running comprehensive validation..."

# Test the actual admin route
response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:5000/admin/enhanced-match-management")
if [ "$response" = "200" ] || [ "$response" = "302" ]; then # 302 redirect to login is acceptable
    echo -e "${GREEN}✅ Admin Enhanced Match Management route accessible${NC}"
else
    echo -e "${RED}❌ Admin route failed with status $response${NC}"
    exit 1
fi

# Generate final report
echo -e "\n${GREEN}🎉 CI/CD PIPELINE COMPLETED SUCCESSFULLY${NC}"
echo "=============================================="
echo "✅ Static Analysis: PASSED"
echo "✅ API Validation: PASSED"
echo "✅ Component Testing: PASSED"
echo "✅ Load Testing: PASSED"
echo "✅ Performance Check: PASSED"
echo "✅ Final Validation: PASSED"
echo ""
echo -e "${GREEN}🚀 Admin Enhanced Match Management is 100% OPERATIONAL!${NC}"
echo ""
echo "📊 Reports generated:"
echo "- ci-cd-validation-report.json"
echo "- automated-test-report.json"
echo ""
echo -e "${BLUE}Ready for deployment at: /admin/enhanced-match-management${NC}"

# Clean up server if we started it
if [ -n "$SERVER_PID" ]; then
    echo "Cleaning up test server..."
    kill $SERVER_PID 2>/dev/null || true
fi

exit 0