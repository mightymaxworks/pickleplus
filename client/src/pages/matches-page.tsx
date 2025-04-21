/**
 * @component MatchesPage
 * @layer UI
 * @module Match
 * @version 1.1.0
 * @lastModified 2025-04-21
 * 
 * @description
 * Main container component for the Match Center feature.
 * Updated to use MatchesContent to fix double header issue.
 */

import React from 'react';
import MatchesContent from '../components/matches/MatchesContent';

export function MatchesPage() {
  return (
    <div className="w-full">
      <MatchesContent />
    </div>
  );
}

export default MatchesPage;