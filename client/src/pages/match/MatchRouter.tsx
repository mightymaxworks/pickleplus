import { useParams, Redirect } from 'wouter';
import QuickMatchRecorder from './QuickMatchRecorder';
import GamifiedMatchRecording from '../GamifiedMatchRecording';

/**
 * MatchRouter - Central Fork routing based on recording mode
 * Routes to appropriate match recording interface based on URL
 */
export default function MatchRouter() {
  const { serial, mode } = useParams();
  
  console.log('[MatchRouter] Routing:', { serial, mode });
  
  if (!serial || !mode) {
    return <Redirect to="/match-arena" />;
  }
  
  switch (mode) {
    case 'live':
      return <GamifiedMatchRecording />;
      
    case 'quick':
      return <QuickMatchRecorder />;
      
    case 'coaching':
      // TODO: Build coaching analysis tool
      console.log('[MatchRouter] Coaching mode coming soon');
      return <QuickMatchRecorder />; // Temporary fallback
      
    default:
      console.error('[MatchRouter] Invalid mode:', mode);
      return <Redirect to="/match-arena" />;
  }
}
