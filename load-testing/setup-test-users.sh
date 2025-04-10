#!/bin/bash
# PKL-278651-PERF-0001-LOAD
# Setup test users for load testing

echo "Setting up test users for load testing..."

# Run the Node.js script to create users
npx tsx load-testing/setup/create-test-users.js

# Check if the command was successful
if [ $? -eq 0 ]; then
  echo "✅ Test users created successfully!"
else
  echo "❌ Failed to create test users. See error messages above."
  exit 1
fi

echo ""
echo "Test users ready for load testing:"
echo "- Username: loadtest_user / Password: pickleballRocks2025!"
echo "- Username: loadtest_admin / Password: adminPass2025!"
echo ""
echo "You can now run load tests with:"
echo "./run-load-test.sh baseline 30s 5"