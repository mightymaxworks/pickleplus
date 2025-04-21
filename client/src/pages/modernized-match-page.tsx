/**
 * @component ModernizedMatchPage
 * @layer UI
 * @module Match
 * @version 1.2.0
 * @lastModified 2025-04-21
 * 
 * @description
 * Wrapper component that uses the MatchesContent component
 * to fix double header issues in the match center.
 */

import MatchesContent from "../components/matches/MatchesContent";

/**
 * ModernizedMatchPage Component
 * 
 * Updated to use the MatchesContent component to avoid double header issues.
 * Implements PKL-278651-UI-0001-STDROUTE from the Pickle+ Development Framework 5.2.
 */
export default function ModernizedMatchPage() {
  return <MatchesContent />;
}