#!/bin/bash

# Update all imports to use the lib/auth centralized approach
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "from '@/hooks/useAuth'" | xargs sed -i "s|from '@/hooks/useAuth'|from '@/lib/auth'|g"

# Show the updated files count
echo "Updated $(find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "from '@/lib/auth'" | wc -l) files"