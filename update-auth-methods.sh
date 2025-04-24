#!/bin/bash

# Replace all occurrences of mutation methods with direct methods
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|logoutMutation.mutate()|logout()|g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|logoutMutation.mutateAsync()|logout()|g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|loginMutation.mutate|login|g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|loginMutation.mutateAsync|login|g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|registerMutation.mutate|register|g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|registerMutation.mutateAsync|register|g"

# Replace all destructuring patterns
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s| loginMutation, | login, |g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s| logoutMutation, | logout, |g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s| registerMutation, | register, |g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s| loginMutation } | login } |g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s| logoutMutation } | logout } |g"
find client/src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s| registerMutation } | register } |g"

echo "Updated auth methods in all files"