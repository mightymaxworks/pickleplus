import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { enableFeature, disableFeature, resetFeature, Features } from "@/lib/featureFlags";

export function FeatureToggler() {
  const [enhancedStatus, setEnhancedStatus] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if enhanced profile is enabled in localStorage
    const status = localStorage.getItem(`feature_${Features.ENHANCED_PROFILE}`);
    setEnhancedStatus(status);
  }, []);
  
  const handleEnable = () => {
    enableFeature(Features.ENHANCED_PROFILE);
  };
  
  const handleDisable = () => {
    disableFeature(Features.ENHANCED_PROFILE);
  };
  
  const handleReset = () => {
    resetFeature(Features.ENHANCED_PROFILE);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card p-4 rounded-lg border shadow-lg text-sm">
      <div className="mb-2 font-medium">Enhanced Profile Feature</div>
      <div className="mb-2">
        Status: {enhancedStatus === 'true' ? '✅ Enabled' : enhancedStatus === 'false' ? '❌ Disabled' : '⚙️ Default'}
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="default" 
          onClick={handleEnable}
          disabled={enhancedStatus === 'true'}
        >
          Enable
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={handleDisable}
          disabled={enhancedStatus === 'false'}
        >
          Disable
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}