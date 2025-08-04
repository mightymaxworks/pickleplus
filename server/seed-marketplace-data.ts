// Seed Coach Marketplace Discovery data for testing
// UDF Development: Coach Marketplace Discovery System

import { db } from './db';
import { 
  coachMarketplaceProfiles, 
  coachMarketplaceReviews 
} from '../shared/schema/coach-marketplace';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedMarketplaceData() {
  console.log('[SEED] Starting Coach Marketplace data seeding...');

  try {
    // Get existing users to create marketplace profiles for
    const existingUsers = await db.select().from(users).limit(10);
    
    if (existingUsers.length === 0) {
      console.log('[SEED] No users found, skipping marketplace seeding');
      return;
    }

    // Sample coach marketplace profiles
    const sampleProfiles = [
      {
        coachId: 1, // This should map to actual coach profile IDs
        userId: existingUsers[0]?.id || 1,
        displayName: 'Sarah Mitchell',
        tagline: 'PCP Level 4 | Strategic Play Specialist',
        specialties: ['Advanced Strategy', 'Tournament Prep', 'Mental Game'],
        location: 'Austin, TX',
        radius: 30,
        hourlyRate: '75.00',
        packageRates: [
          { sessionCount: 4, price: 280, description: '4-session package' },
          { sessionCount: 8, price: 520, description: '8-session intensive' }
        ],
        availableTimeSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' }
        ],
        averageRating: '4.8',
        totalReviews: 24,
        totalSessions: 156,
        responseTime: 12,
        teachingStyle: {
          approach: 'strategic',
          intensity: 'moderate',
          focus: 'advanced'
        },
        playerPreferences: {
          ageGroups: ['Adult', 'Senior'],
          skillLevels: ['Intermediate', 'Advanced'],
          sessionTypes: ['Individual', 'Doubles Strategy']
        },
        isDiscoverable: true,
        isPremiumListed: true
      },
      {
        coachId: 2,
        userId: existingUsers[1]?.id || 2,
        displayName: 'Mike Rodriguez',
        tagline: 'Youth Development Expert | PCP Level 3',
        specialties: ['Youth Coaching', 'Technical Skills', 'Beginner Coaching'],
        location: 'Denver, CO',
        radius: 25,
        hourlyRate: '60.00',
        packageRates: [
          { sessionCount: 6, price: 330, description: 'Youth development package' },
          { sessionCount: 10, price: 550, description: 'Complete beginner course' }
        ],
        availableTimeSlots: [
          { day: 'Tuesday', startTime: '15:00', endTime: '19:00' },
          { day: 'Thursday', startTime: '15:00', endTime: '19:00' },
          { day: 'Saturday', startTime: '08:00', endTime: '16:00' }
        ],
        averageRating: '4.6',
        totalReviews: 18,
        totalSessions: 89,
        responseTime: 8,
        teachingStyle: {
          approach: 'technical',
          intensity: 'relaxed',
          focus: 'beginner'
        },
        playerPreferences: {
          ageGroups: ['Youth', 'Teen'],
          skillLevels: ['Beginner', 'Intermediate'],
          sessionTypes: ['Individual', 'Group']
        },
        isDiscoverable: true,
        isPremiumListed: false
      },
      {
        coachId: 3,
        userId: existingUsers[2]?.id || 3,
        displayName: 'Lisa Chen',
        tagline: 'Doubles Strategy Master | Senior Player Specialist',
        specialties: ['Doubles Strategy', 'Senior Coaching', 'Court Movement'],
        location: 'Phoenix, AZ',
        radius: 40,
        hourlyRate: '80.00',
        packageRates: [
          { sessionCount: 3, price: 225, description: 'Doubles intensive' },
          { sessionCount: 6, price: 420, description: 'Complete doubles mastery' }
        ],
        availableTimeSlots: [
          { day: 'Monday', startTime: '07:00', endTime: '11:00' },
          { day: 'Wednesday', startTime: '07:00', endTime: '11:00' },
          { day: 'Friday', startTime: '07:00', endTime: '11:00' },
          { day: 'Sunday', startTime: '08:00', endTime: '12:00' }
        ],
        averageRating: '4.9',
        totalReviews: 31,
        totalSessions: 203,
        responseTime: 6,
        teachingStyle: {
          approach: 'strategic',
          intensity: 'intense',
          focus: 'advanced'
        },
        playerPreferences: {
          ageGroups: ['Adult', 'Senior'],
          skillLevels: ['Intermediate', 'Advanced'],
          sessionTypes: ['Doubles Strategy', 'Individual']
        },
        isDiscoverable: true,
        isPremiumListed: true
      },
      {
        coachId: 4,
        userId: existingUsers[3]?.id || 4,
        displayName: 'James Thompson',
        tagline: 'Mental Game Coach | Tournament Psychology',
        specialties: ['Mental Game', 'Tournament Prep', 'Physical Conditioning'],
        location: 'Seattle, WA',
        radius: 35,
        hourlyRate: '85.00',
        packageRates: [
          { sessionCount: 5, price: 400, description: 'Mental game intensive' },
          { sessionCount: 8, price: 640, description: 'Tournament preparation' }
        ],
        availableTimeSlots: [
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '15:00' }
        ],
        averageRating: '4.7',
        totalReviews: 22,
        totalSessions: 134,
        responseTime: 24,
        teachingStyle: {
          approach: 'mental',
          intensity: 'moderate',
          focus: 'all-levels'
        },
        playerPreferences: {
          ageGroups: ['Teen', 'Adult'],
          skillLevels: ['Intermediate', 'Advanced'],
          sessionTypes: ['Individual', 'Mental Training']
        },
        isDiscoverable: true,
        isPremiumListed: false
      },
      {
        coachId: 5,
        userId: existingUsers[4]?.id || 5,
        displayName: 'Amanda Foster',
        tagline: 'Serve & Return Specialist | Technical Excellence',
        specialties: ['Serve & Return', 'Technical Skills', 'Singles Strategy'],
        location: 'Miami, FL',
        radius: 20,
        hourlyRate: '70.00',
        packageRates: [
          { sessionCount: 4, price: 260, description: 'Serve mastery clinic' },
          { sessionCount: 7, price: 455, description: 'Complete technical overhaul' }
        ],
        availableTimeSlots: [
          { day: 'Monday', startTime: '06:00', endTime: '10:00' },
          { day: 'Wednesday', startTime: '06:00', endTime: '10:00' },
          { day: 'Friday', startTime: '06:00', endTime: '10:00' },
          { day: 'Saturday', startTime: '16:00', endTime: '20:00' }
        ],
        averageRating: '4.5',
        totalReviews: 15,
        totalSessions: 67,
        responseTime: 18,
        teachingStyle: {
          approach: 'technical',
          intensity: 'intense',
          focus: 'intermediate'
        },
        playerPreferences: {
          ageGroups: ['Adult'],
          skillLevels: ['Beginner', 'Intermediate', 'Advanced'],
          sessionTypes: ['Individual', 'Technical Training']
        },
        isDiscoverable: true,
        isPremiumListed: false
      }
    ];

    // Insert marketplace profiles
    for (const profile of sampleProfiles) {
      await db.insert(coachMarketplaceProfiles).values(profile).onConflictDoNothing();
    }

    // Sample reviews
    const sampleReviews = [
      {
        coachId: 1,
        reviewerId: existingUsers[5]?.id || 6,
        rating: 5,
        title: 'Excellent strategic coaching',
        content: 'Sarah helped me understand court positioning and shot selection like never before. My tournament performance has improved dramatically.',
        technicalSkills: 5,
        communication: 5,
        reliability: 5,
        valueForMoney: 4,
        tags: ['strategy', 'tournaments', 'positioning'],
        isVerifiedBooking: true,
        isApproved: true
      },
      {
        coachId: 1,
        reviewerId: existingUsers[6]?.id || 7,
        rating: 5,
        title: 'Great mental game work',
        content: 'The mental coaching techniques Sarah taught me have made a huge difference in my competitive play.',
        technicalSkills: 4,
        communication: 5,
        reliability: 5,
        valueForMoney: 5,
        tags: ['mental-game', 'competition'],
        isVerifiedBooking: true,
        isApproved: true
      },
      {
        coachId: 2,
        reviewerId: existingUsers[7]?.id || 8,
        rating: 5,
        title: 'Amazing with kids',
        content: 'Mike is fantastic with young players. My 12-year-old loves the sessions and has improved so much.',
        technicalSkills: 5,
        communication: 5,
        reliability: 5,
        valueForMoney: 5,
        tags: ['youth', 'patient', 'fun'],
        isVerifiedBooking: true,
        isApproved: true
      },
      {
        coachId: 3,
        reviewerId: existingUsers[8]?.id || 9,
        rating: 5,
        title: 'Doubles game transformed',
        content: 'Lisa completely changed how I think about doubles strategy. We went from losing most matches to winning consistently.',
        technicalSkills: 5,
        communication: 4,
        reliability: 5,
        valueForMoney: 5,
        tags: ['doubles', 'strategy', 'teamwork'],
        isVerifiedBooking: true,
        isApproved: true
      },
      {
        coachId: 4,
        reviewerId: existingUsers[9]?.id || 10,
        rating: 4,
        title: 'Mental toughness coaching',
        content: 'James helped me overcome match anxiety and stay focused under pressure. Still working on consistency but seeing great progress.',
        technicalSkills: 4,
        communication: 5,
        reliability: 4,
        valueForMoney: 4,
        tags: ['mental-game', 'anxiety', 'focus'],
        isVerifiedBooking: true,
        isApproved: true
      }
    ];

    // Insert reviews
    for (const review of sampleReviews) {
      await db.insert(coachMarketplaceReviews).values(review).onConflictDoNothing();
    }

    console.log('[SEED] Coach Marketplace data seeding completed successfully');
    console.log(`[SEED] Inserted ${sampleProfiles.length} marketplace profiles`);
    console.log(`[SEED] Inserted ${sampleReviews.length} reviews`);

  } catch (error) {
    console.error('[SEED] Error seeding marketplace data:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  seedMarketplaceData().then(() => {
    console.log('[SEED] Marketplace seeding complete');
    process.exit(0);
  }).catch((error) => {
    console.error('[SEED] Marketplace seeding failed:', error);
    process.exit(1);
  });
}

export { seedMarketplaceData };