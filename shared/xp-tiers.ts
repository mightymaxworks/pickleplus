// XP Tier System for Pickle+
// This file defines the tier levels, names, and associated colors for the XP system

export interface XPTier {
  id: number;
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number;
  color: string; // Tailwind CSS color class
  textColor: string; // Text color to use with this tier's background
  gradientFrom: string; // For gradient effects
  gradientTo: string; // For gradient effects
}

// The 7 tiers of pickleball expertise
export const XP_TIERS: XPTier[] = [
  {
    id: 1,
    name: "Dink Dabbler",
    description: "Beginning your pickleball journey with the basic dink shot.",
    minLevel: 1,
    maxLevel: 15,
    color: "bg-green-100",
    textColor: "text-green-700",
    gradientFrom: "from-green-50",
    gradientTo: "to-green-200",
  },
  {
    id: 2,
    name: "Paddle Apprentice",
    description: "Developing your paddle handling skills and basic shot techniques.",
    minLevel: 16,
    maxLevel: 30,
    color: "bg-teal-100",
    textColor: "text-teal-700",
    gradientFrom: "from-teal-50",
    gradientTo: "to-teal-200",
  },
  {
    id: 3,
    name: "Rally Regular",
    description: "Able to maintain rallies with consistent play and shot selection.",
    minLevel: 31,
    maxLevel: 45,
    color: "bg-blue-100",
    textColor: "text-blue-700",
    gradientFrom: "from-blue-50",
    gradientTo: "to-blue-200",
  },
  {
    id: 4,
    name: "Kitchen Commander",
    description: "Mastering the non-volley zone tactics and strategic positioning.",
    minLevel: 46,
    maxLevel: 60,
    color: "bg-purple-100",
    textColor: "text-purple-700",
    gradientFrom: "from-purple-50",
    gradientTo: "to-purple-200",
  },
  {
    id: 5,
    name: "Serve Specialist",
    description: "Expert serving techniques that put opponents at a disadvantage.",
    minLevel: 61,
    maxLevel: 75,
    color: "bg-orange-100",
    textColor: "text-orange-700",
    gradientFrom: "from-orange-50", 
    gradientTo: "to-orange-200",
  },
  {
    id: 6,
    name: "Volley Virtuoso",
    description: "Exceptional mid-air shot execution and quick reflex responses.",
    minLevel: 76,
    maxLevel: 90,
    color: "bg-gray-100",
    textColor: "text-gray-700",
    gradientFrom: "from-gray-50", 
    gradientTo: "to-gray-200",
  },
  {
    id: 7,
    name: "Pickleball Pro",
    description: "Elite skill level with mastery of all aspects of the game.",
    minLevel: 91,
    maxLevel: 100,
    color: "bg-yellow-100",
    textColor: "text-yellow-700",
    gradientFrom: "from-yellow-50",
    gradientTo: "to-yellow-200",
  }
];

/**
 * Get the tier for a given level
 * @param level User's current level
 * @returns The tier corresponding to the level
 */
export function getTierByLevel(level: number): XPTier {
  return XP_TIERS.find(tier => level >= tier.minLevel && level <= tier.maxLevel) || XP_TIERS[0];
}

/**
 * Calculate progress within the current tier
 * @param level User's current level
 * @returns Percentage progress within the tier (0-100)
 */
export function getTierProgress(level: number): number {
  const tier = getTierByLevel(level);
  const tierRange = tier.maxLevel - tier.minLevel + 1;
  const levelWithinTier = level - tier.minLevel + 1;
  return Math.min(100, Math.max(0, Math.round((levelWithinTier / tierRange) * 100)));
}

/**
 * Get the next tier for a user
 * @param level User's current level
 * @returns The next tier or null if user is at max tier
 */
export function getNextTier(level: number): XPTier | null {
  const currentTier = getTierByLevel(level);
  const nextTierIndex = XP_TIERS.findIndex(tier => tier.id === currentTier.id) + 1;
  return nextTierIndex < XP_TIERS.length ? XP_TIERS[nextTierIndex] : null;
}

/**
 * Calculate levels remaining until next tier
 * @param level User's current level
 * @returns Number of levels until next tier or 0 if at max tier
 */
export function getLevelsUntilNextTier(level: number): number {
  const currentTier = getTierByLevel(level);
  if (currentTier.id === XP_TIERS[XP_TIERS.length - 1].id) {
    return 0; // Max tier
  }
  return currentTier.maxLevel - level + 1;
}