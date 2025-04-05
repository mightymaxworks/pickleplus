import { useQuery } from "@tanstack/react-query";

type XPTierData = {
  tier: string;
  tierDescription: string;
  tierProgress: number;
  nextTier: string | null;
  levelUntilNextTier: number;
};

type TierInfo = {
  name: string;
  description: string;
  color: string;
  textColor: string;
  minLevel: number;
  maxLevel: number;
};

// Tier definitions
const tiers: TierInfo[] = [
  {
    name: "Dink Dabbler",
    description: "Just getting started",
    color: "#8BC34A", // Light green
    textColor: "#212121",
    minLevel: 1,
    maxLevel: 15
  },
  {
    name: "Paddle Apprentice",
    description: "Building fundamentals",
    color: "#009688", // Teal
    textColor: "#FFFFFF",
    minLevel: 16,
    maxLevel: 30
  },
  {
    name: "Rally Regular",
    description: "Consistent player",
    color: "#2196F3", // Blue
    textColor: "#FFFFFF",
    minLevel: 31,
    maxLevel: 45
  },
  {
    name: "Kitchen Commander",
    description: "Non-volley zone expert",
    color: "#673AB7", // Purple
    textColor: "#FFFFFF",
    minLevel: 46,
    maxLevel: 60
  },
  {
    name: "Serve Specialist",
    description: "Advanced techniques",
    color: "#FF9800", // Orange/Bronze
    textColor: "#212121",
    minLevel: 61,
    maxLevel: 75
  },
  {
    name: "Volley Virtuoso",
    description: "Master of quick exchanges",
    color: "#9E9E9E", // Silver/Light Gray
    textColor: "#212121",
    minLevel: 76,
    maxLevel: 90
  },
  {
    name: "Pickleball Pro",
    description: "Elite player",
    color: "#FFD700", // Gold/Yellow
    textColor: "#212121",
    minLevel: 91,
    maxLevel: 100
  }
];

// Helper function to get tier info based on level
export function getXPTierInfo(level: number): TierInfo {
  // Find the tier for the given level
  const tier = tiers.find(tier => level >= tier.minLevel && level <= tier.maxLevel);
  
  // Default to the first tier if no match (shouldn't happen with proper level ranges)
  return tier || tiers[0];
}

// Helper function to get profile coloring based on level
export function getProfileColorsByLevel(level: number) {
  const tierInfo = getXPTierInfo(level);
  
  return {
    bg: `bg-[${tierInfo.color}]`,
    text: `text-[${tierInfo.textColor}]`,
    border: `border-[${tierInfo.color}]`
  };
}

export function useXPTier() {
  const {
    data: tierInfo,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<XPTierData>({
    queryKey: ["/api/user/xp-tier"],
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    tierInfo,
    isLoading,
    isError,
    error,
    refetchTierInfo: refetch,
  };
}