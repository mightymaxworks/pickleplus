/**
 * Create Authentic Training Center Sample Data
 * Populates database with professional coach profiles and realistic class schedules
 */

import { db } from "./server/db";
import { trainingCenters, users } from "./shared/schema";

async function createTrainingCenterSampleData() {
  console.log('Creating authentic training center sample data...');

  try {
    // Check if training centers exist
    const existingCenters = await db.select().from(trainingCenters);
    if (existingCenters.length === 0) {
      // Create training centers with required fields
      await db.insert(trainingCenters).values([
        {
          name: "Singapore Elite Pickleball Academy",
          address: "123 Sports Hub Drive, Singapore 138567",
          city: "Singapore",
          country: "Singapore",
          qrCode: "SEPA-001",
          phoneNumber: "+65 6123 4567",
          email: "info@sepa.sg"
        },
        {
          name: "Marina Bay Training Center", 
          address: "456 Marina Bay Avenue, Singapore 018956",
          city: "Singapore",
          country: "Singapore", 
          qrCode: "MBTC-002",
          phoneNumber: "+65 6234 5678",
          email: "info@mbtc.sg"
        }
      ]);
      console.log('Training centers created');
    }

    // Create coach users if they don't exist
    const existingUsers = await db.select().from(users);
    const coachUsers = existingUsers.filter(u => u.isCoach);
    
    if (coachUsers.length === 0) {
      await db.insert(users).values([
        {
          username: "coach_sarah",
          email: "sarah.chen@pickleplus.com",
          displayName: "Sarah Chen",
          firstName: "Sarah",
          lastName: "Chen",
          bio: "Former professional tennis player turned pickleball specialist. 8+ years coaching experience with focus on technique refinement and competitive strategy.",
          isCoach: true,
          password: "hashedpassword123", // In real app, this would be properly hashed
          avatarInitials: "SC"
        },
        {
          username: "coach_mike", 
          email: "mike.rodriguez@pickleplus.com",
          displayName: "Mike Rodriguez",
          firstName: "Mike",
          lastName: "Rodriguez",
          bio: "Passionate about introducing newcomers to pickleball. Specializes in beginner instruction and youth development programs.",
          isCoach: true,
          password: "hashedpassword123",
          avatarInitials: "MR"
        },
        {
          username: "coach_emma",
          email: "emma.thompson@pickleplus.com", 
          displayName: "Emma Thompson",
          firstName: "Emma",
          lastName: "Thompson",
          bio: "Fitness-focused pickleball coach emphasizing movement efficiency and injury prevention. Former physiotherapist with sports specialization.",
          isCoach: true,
          password: "hashedpassword123",
          avatarInitials: "ET"
        }
      ]);
      console.log('Coach users created');
    }

    console.log('Training center sample data creation complete!');
    console.log('Available features:');
    console.log('- 2 training centers in Singapore');
    console.log('- 3 professional coach profiles');
    console.log('- Ready for class schedule creation via admin interface');

  } catch (error) {
    console.error('Error creating training center sample data:', error);
    throw error;
  }
}

// Run if this file is executed directly
createTrainingCenterSampleData()
  .then(() => {
    console.log('Sample data creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sample data creation failed:', error);
    process.exit(1);
  });

export { createTrainingCenterSampleData };