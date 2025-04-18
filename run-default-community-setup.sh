#!/bin/bash

# PKL-278651-COMM-0020-DEFGRP - Default Community Setup
# This script runs all the necessary migrations to set up the default community feature

echo "=== Starting Default Community Setup ==="
echo "1. Running schema migration to add isDefault field"
npx tsx run-community-default-field-migration.ts

echo ""
echo "2. Creating Pickle+ Giveaway Group and adding existing users"
npx tsx run-default-community-migration.ts

echo ""
echo "=== Default Community Setup Complete ==="
echo "New users will now be automatically added to the Pickle+ Giveaway Group"