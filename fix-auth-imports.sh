#!/bin/bash

# Files to update - based on our grep search results
FILES=(
  "client/src/components/ranking/MultiDimensionalRankingCard.tsx"
  "client/src/components/ranking/PCPGlobalRankingCard.tsx"
  "client/src/components/match/NewMatchRecordingForm.tsx"
  "client/src/components/match/MatchStatsDetail.tsx"
  "client/src/components/CodeRedemptionForm.tsx"
  "client/src/components/AuthLayout.tsx"
  "client/src/components/MatchRecordingForm.tsx"
  "client/src/components/Header.tsx"
  "client/src/components/ProtectedRoute.tsx"
  "client/src/pages/Tournaments.tsx"
  "client/src/pages/Achievements.tsx"
  "client/src/pages/Leaderboard.tsx"
  "client/src/pages/AdminCodesPage.tsx"
  "client/src/pages/PreferencesPage.tsx"
  "client/src/pages/match-page.tsx"
  "client/src/pages/EnhancedProfile.tsx"
  "client/src/pages/Profile.tsx"
)

# Update each file to use the new import path
for file in "${FILES[@]}"; do
  echo "Updating $file"
  sed -i 's|import { useAuth } from "@/hooks/useAuth";|import { useAuth } from "@/lib/auth";|g' "$file" || echo "Failed to update $file"
done

echo "All files updated!"
