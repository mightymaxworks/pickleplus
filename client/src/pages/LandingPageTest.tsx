import { EnhancedHeroSection } from '@/components/EnhancedHeroSection';
import { CourtIQExplanationSection } from '@/components/CourtIQExplanationSection';
import { RatingSystemsIntegrationSection } from '@/components/RatingSystemsIntegrationSection';
import { EnhancedChangelogSection } from '@/components/EnhancedChangelogSection';

export default function LandingPageTest() {
  return (
    <div className="landing-page overflow-x-hidden w-full">
      {/* Enhanced Hero Section */}
      <EnhancedHeroSection />

      {/* CourtIQ Explanation Section */}
      <CourtIQExplanationSection />
      
      {/* Rating Systems Integration Section */}
      <RatingSystemsIntegrationSection />
      
      {/* Enhanced Changelog Section */}
      <EnhancedChangelogSection />
    </div>
  );
}