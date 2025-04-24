#!/bin/bash

# Find all files importing useAuth from hooks and update them to use the context version
grep -l "import { useAuth } from '@/hooks/useAuth'" client/src/ | xargs sed -i "s|import { useAuth } from '@/hooks/useAuth'|import { useAuth } from '@/lib/auth'|g"

# Show how many files were updated
echo "Updated $(grep -l "import { useAuth } from '@/lib/auth'" client/src/ | wc -l) files"