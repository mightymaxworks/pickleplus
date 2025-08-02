/**
 * Coach Management Relations
 * PKL-278651-PCP-BASIC-TIER - Comprehensive Basic Tier Implementation
 * 
 * Drizzle ORM relations for coach management tables
 */

import { relations } from 'drizzle-orm';
import { users } from '../schema';
import { 
  coachProfiles, 
  coachApplications, 
  coachCertifications, 
  coachReviews 
} from './coach-management';

// Coach Profiles Relations
export const coachProfilesRelations = relations(coachProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [coachProfiles.userId],
    references: [users.id]
  }),
  
  reviews: many(coachReviews)
}));

// Coach Applications Relations
export const coachApplicationsRelations = relations(coachApplications, ({ one, many }) => ({
  user: one(users, {
    fields: [coachApplications.userId],
    references: [users.id]
  }),
  
  certifications: many(coachCertifications)
}));

// Coach Certifications Relations
export const coachCertificationsRelations = relations(coachCertifications, ({ one }) => ({
  application: one(coachApplications, {
    fields: [coachCertifications.applicationId],
    references: [coachApplications.id]
  })
}));

// Coach Reviews Relations
export const coachReviewsRelations = relations(coachReviews, ({ one }) => ({
  coach: one(users, {
    fields: [coachReviews.coachId],
    references: [users.id]
  }),
  
  student: one(users, {
    fields: [coachReviews.studentId],
    references: [users.id]
  }),
  
  coachProfile: one(coachProfiles, {
    fields: [coachReviews.coachId],
    references: [coachProfiles.userId]
  })
}));