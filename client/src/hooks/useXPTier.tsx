import { useQuery } from "@tanstack/react-query";

type XPTierData = {
  tier: string;
  tierDescription: string;
  tierProgress: number;
  nextTier: string | null;
  levelUntilNextTier: number;
};

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