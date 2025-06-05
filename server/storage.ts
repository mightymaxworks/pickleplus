import {
  users, type User, type InsertUser,
  profileCompletionTracking, type ProfileCompletionTracking, type InsertProfileCompletionTracking,
  matches, type Match, type InsertMatch,
  tournaments,
  type XpTransaction, type InsertXpTransaction,
  activities, type InsertActivity
} from "@shared/schema";

import { generateUniquePassportCode } from './utils/passport-generator';
import { db } from "./db";
import { eq, desc, asc, and, or, gte, lte, count, sum, avg, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: any;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  updateUserProfile(id: number, profileData: Partial<InsertUser>): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  
  // Profile completion tracking
  getProfileCompletion(userId: number): Promise<ProfileCompletionTracking | undefined>;
  updateProfileCompletion(userId: number, data: Partial<InsertProfileCompletionTracking>): Promise<ProfileCompletionTracking>;
  
  // Placeholder methods for build compatibility
  awardXpToUser(userId: number, amount: number, source: string): Promise<void>;
  createConciergeInteraction(data: any): Promise<any>;
  getConciergeInteractions(): Promise<any[]>;
  updateConciergeInteractionStatus(): Promise<void>;
  getUserCount(): Promise<number>;
  getMatchCount(): Promise<number>;
  getTournamentCount(): Promise<number>;
  getMatchesByUser(userId: number): Promise<Match[]>;
  getMatchStats(userId: number, timeRange?: string): Promise<any>;
  getPicklePoints(userId: number): Promise<number>;
  getTournamentParticipationByUser(userId: number): Promise<any[]>;
  createAuditLog(data: any): Promise<void>;
  
  // Training Center operations
  getTrainingCenterByQrCode(qrCode: string): Promise<any>;
  getActiveTrainingCenters(): Promise<any[]>;
  getAvailableCoach(centerId: number): Promise<any>;
  
  // Calendar operations
  getWeeklyClassSchedule(centerId: number): Promise<any[]>;
  getClassesForDate(centerId: number, date: Date): Promise<any[]>;
  getClassDetails(classId: number): Promise<any>;
  getClassEnrollment(classId: number, playerId: number): Promise<any>;
  enrollInClass(enrollment: any): Promise<any>;
  cancelClassEnrollment(classId: number, playerId: number): Promise<boolean>;
  getUserEnrolledClasses(playerId: number, upcomingOnly: boolean): Promise<any[]>;
  createClassTemplate(template: any): Promise<any>;
  generateClassInstances(templateId: number, startDate: Date, endDate: Date, skipDates: Date[]): Promise<any[]>;
  getAvailableCoachesAtCenter(centerId: number): Promise<any[]>;
  getTrainingCenter(centerId: number): Promise<any>;
  getActiveSessionForPlayer(playerId: number): Promise<any>;
  createCoachingSession(sessionData: any): Promise<any>;
  getCoachingSessionById(sessionId: number): Promise<any>;
  updateCoachingSession(sessionId: number, updateData: any): Promise<any>;
  getChallengesBySkillLevel(skillLevel: string): Promise<any[]>;
  getChallengeById(challengeId: number): Promise<any>;
  createChallengeCompletion(completionData: any): Promise<any>;
  awardPlayerBadge(badgeData: any): Promise<any>;
  getSessionSummary(sessionId: number): Promise<any>;
  getPlayerTrainingProgress(playerId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = { ...insertUser };
    if (!userData.passportCode) {
      userData.passportCode = await generateUniquePassportCode();
    }
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: number, profileData: Partial<InsertUser>): Promise<User> {
    console.log(`[Storage] Updating profile for user ${id} with data:`, profileData);
    const [user] = await db.update(users)
      .set(profileData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    console.log(`[Storage] Profile updated successfully for user ${id}`);
    return user;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));
  }

  async getProfileCompletion(userId: number): Promise<ProfileCompletionTracking | undefined> {
    return undefined; // Placeholder
  }

  async updateProfileCompletion(userId: number, data: Partial<InsertProfileCompletionTracking>): Promise<ProfileCompletionTracking> {
    return {} as ProfileCompletionTracking; // Placeholder
  }

  async awardXpToUser(userId: number, amount: number, source: string): Promise<void> {
    console.log('XP award placeholder:', userId, amount, source);
  }
  
  async createConciergeInteraction(data: any): Promise<any> {
    return { id: 1 };
  }
  
  async getConciergeInteractions(): Promise<any[]> {
    return [];
  }
  
  async updateConciergeInteractionStatus(): Promise<void> {}

  async getUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count || 0;
  }

  async getMatchCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(matches);
    return result[0]?.count || 0;
  }

  async getTournamentCount(): Promise<number> {
    // Return placeholder count for tournaments
    return 0;
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    const userMatches = await db.select()
      .from(matches)
      .where(or(eq(matches.playerOneId, userId), eq(matches.playerTwoId, userId)))
      .orderBy(desc(matches.createdAt))
      .limit(50);
    return userMatches;
  }

  async getMatchStats(userId: number, timeRange?: string): Promise<any> {
    const userMatches = await this.getMatchesByUser(userId);
    
    const totalMatches = userMatches.length;
    const matchesWon = userMatches.filter(match => match.winnerId === userId).length;
    const winRate = totalMatches > 0 ? (matchesWon / totalMatches) * 100 : 0;
    
    return {
      totalMatches,
      matchesWon,
      matchesLost: totalMatches - matchesWon,
      winRate: Math.round(winRate * 100) / 100,
      recentMatches: userMatches.slice(0, 5)
    };
  }

  async getPicklePoints(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user?.picklePoints || 0;
  }

  async getTournamentParticipationByUser(userId: number): Promise<any[]> {
    // Query tournament registrations for the user
    const registrations = await db.select()
      .from(tournaments)
      .where(sql`${tournaments.id} IN (
        SELECT tournament_id FROM tournament_registrations 
        WHERE user_id = ${userId}
      )`)
      .limit(50);
    
    return registrations.map(tournament => ({
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      division: tournament.division,
      format: tournament.format,
      startDate: tournament.startDate,
      level: tournament.level || 'local'
    }));
  }

  async createAuditLog(data: any): Promise<void> {
    console.log('Audit log entry:', data);
  }

  // Training Center operations
  async getTrainingCenterByQrCode(qrCode: string): Promise<any> {
    const [center] = await db.execute(sql`
      SELECT * FROM training_centers 
      WHERE qr_code = ${qrCode} AND is_active = true
    `);
    return center;
  }

  async getActiveTrainingCenters(): Promise<any[]> {
    const centers = await db.execute(sql`
      SELECT * FROM training_centers 
      WHERE is_active = true
      ORDER BY name
    `);
    return centers;
  }

  async getAvailableCoach(centerId: number): Promise<any> {
    const [coach] = await db.execute(sql`
      SELECT u.* FROM users u
      WHERE u.is_coach = true
      AND u.id NOT IN (
        SELECT DISTINCT cs.coach_id 
        FROM coaching_sessions cs 
        WHERE cs.center_id = ${centerId} 
        AND cs.status = 'active'
      )
      LIMIT 1
    `);
    return coach;
  }

  async getAvailableCoachesAtCenter(centerId: number): Promise<any[]> {
    // Return mock coaches with comprehensive data for testing
    return [
      {
        id: 2,
        name: "Coach Alex",
        fullName: "Alexandra Rodriguez",
        displayName: "Coach Alex",
        username: "coach_alex",
        profileImage: "/uploads/coaches/alexandra-rodriguez.jpg",
        specializations: ["Forehand Technique", "Strategy", "Doubles Play"],
        hourlyRate: 75,
        experience: "8 years",
        certifications: ["USAPA Certified", "PPR Level 3"],
        accolades: ["2023 Regional Coach of the Year", "Tournament Champion 2022", "Advanced Coaching Certification"]
      },
      {
        id: 3,
        name: "Coach Maria",
        fullName: "Maria Santos",
        displayName: "Coach Maria",
        username: "coach_maria",
        profileImage: "/uploads/coaches/maria-santos.jpg",
        specializations: ["Serve Development", "Mental Game", "Tournament Prep"],
        hourlyRate: 85,
        experience: "12 years",
        certifications: ["USAPA Master Trainer", "Sports Psychology Certified"],
        accolades: ["National Tournament Finalist", "Mental Performance Specialist", "Elite Coach Recognition"]
      },
      {
        id: 4,
        name: "Coach David",
        fullName: "David Thompson",
        displayName: "Coach David",
        username: "coach_david",
        profileImage: "/uploads/coaches/david-thompson.jpg",
        specializations: ["Backhand Fundamentals", "Footwork", "Beginner Training"],
        hourlyRate: 65,
        experience: "5 years",
        certifications: ["USAPA Certified", "Youth Training Specialist"],
        accolades: ["Rising Coach Award 2023", "Community Impact Recognition", "Skills Development Expert"]
      }
    ];
  }

  async getTrainingCenter(centerId: number): Promise<any> {
    // Return mock training center data
    return {
      id: centerId,
      name: "Community Sports Hub",
      address: "123 Sports Complex Drive",
      city: "Singapore",
      qrCode: "TC001-SG",
      courtCount: 6,
      operatingHours: {
        weekday: "6:00 AM - 10:00 PM",
        weekend: "7:00 AM - 9:00 PM"
      }
    };
  }

  async getActiveSessionForPlayer(playerId: number): Promise<any> {
    const [session] = await db.execute(sql`
      SELECT cs.*, tc.name as center_name, u.display_name as coach_name
      FROM coaching_sessions cs
      JOIN training_centers tc ON cs.center_id = tc.id
      JOIN users u ON cs.coach_id = u.id
      WHERE cs.player_id = ${playerId} 
      AND cs.status = 'active'
    `);
    return session;
  }

  async createCoachingSession(sessionData: any): Promise<any> {
    const [session] = await db.execute(sql`
      INSERT INTO coaching_sessions (
        player_id, coach_id, center_id, session_type, 
        check_in_time, status
      ) VALUES (
        ${sessionData.playerId}, ${sessionData.coachId}, ${sessionData.centerId},
        ${sessionData.sessionType}, ${sessionData.checkInTime.toISOString()}, 
        ${sessionData.status}
      ) RETURNING *
    `);
    return session;
  }

  async getCoachingSessionById(sessionId: number): Promise<any> {
    const [session] = await db.execute(sql`
      SELECT * FROM coaching_sessions WHERE id = ${sessionId}
    `);
    return session;
  }

  async updateCoachingSession(sessionId: number, updateData: any): Promise<any> {
    const updates = [];
    const values = [];
    
    if (updateData.playerGoals) {
      updates.push('player_goals = ?');
      values.push(updateData.playerGoals);
    }
    if (updateData.skillsFocused) {
      updates.push('skills_focused = ?');
      values.push(JSON.stringify(updateData.skillsFocused));
    }
    if (updateData.status) {
      updates.push('status = ?');
      values.push(updateData.status);
    }
    if (updateData.checkOutTime) {
      updates.push('check_out_time = ?');
      values.push(updateData.checkOutTime.toISOString());
    }
    if (updateData.actualDuration) {
      updates.push('actual_duration = ?');
      values.push(updateData.actualDuration);
    }
    if (updateData.coachObservations) {
      updates.push('coach_observations = ?');
      values.push(updateData.coachObservations);
    }
    if (updateData.sessionNotes) {
      updates.push('session_notes = ?');
      values.push(updateData.sessionNotes);
    }

    values.push(sessionId);
    
    const [session] = await db.execute(sql`
      UPDATE coaching_sessions 
      SET ${sql.raw(updates.join(', '))} 
      WHERE id = ${sessionId} 
      RETURNING *
    `);
    return session;
  }

  async getChallengesBySkillLevel(skillLevel: string): Promise<any[]> {
    const challenges = await db.execute(sql`
      SELECT * FROM challenges 
      WHERE skill_level = ${skillLevel} AND is_active = true
      ORDER BY difficulty_rating, name
    `);
    return challenges;
  }

  async getChallengeById(challengeId: number): Promise<any> {
    const [challenge] = await db.execute(sql`
      SELECT * FROM challenges WHERE id = ${challengeId}
    `);
    return challenge;
  }

  async createChallengeCompletion(completionData: any): Promise<any> {
    const [completion] = await db.execute(sql`
      INSERT INTO challenge_completions (
        session_id, challenge_id, player_id, coach_id,
        is_completed, actual_result, success_rate, time_spent,
        coach_notes, improvement_areas, next_recommendations, completed_at
      ) VALUES (
        ${completionData.sessionId}, ${completionData.challengeId}, 
        ${completionData.playerId}, ${completionData.coachId},
        ${completionData.isCompleted}, ${JSON.stringify(completionData.actualResult)},
        ${completionData.successRate}, ${completionData.timeSpent},
        ${completionData.coachNotes}, ${JSON.stringify(completionData.improvementAreas)},
        ${completionData.nextRecommendations}, ${completionData.completedAt.toISOString()}
      ) RETURNING *
    `);
    return completion;
  }

  async awardPlayerBadge(badgeData: any): Promise<any> {
    const [badge] = await db.execute(sql`
      INSERT INTO player_badges (
        player_id, badge_name, session_id, challenge_id, coach_id, earned_at
      ) VALUES (
        ${badgeData.playerId}, ${badgeData.badgeName}, ${badgeData.sessionId},
        ${badgeData.challengeId}, ${badgeData.coachId}, ${badgeData.earnedAt.toISOString()}
      ) RETURNING *
    `);
    return badge;
  }

  async getSessionSummary(sessionId: number): Promise<any> {
    const summary = await db.execute(sql`
      SELECT 
        cs.*,
        COUNT(cc.id) as challenges_completed,
        COUNT(CASE WHEN cc.is_completed = true THEN 1 END) as challenges_successful,
        COUNT(pb.id) as badges_earned
      FROM coaching_sessions cs
      LEFT JOIN challenge_completions cc ON cs.id = cc.session_id
      LEFT JOIN player_badges pb ON cs.id = pb.session_id
      WHERE cs.id = ${sessionId}
      GROUP BY cs.id
    `);
    return summary[0];
  }

  async getPlayerTrainingProgress(playerId: number): Promise<any> {
    const progress = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT cs.id) as total_sessions,
        COUNT(cc.id) as total_challenges_completed,
        ROUND(AVG(CASE WHEN cc.is_completed = true THEN 100.0 ELSE 0.0 END), 2) as success_rate,
        COUNT(pb.id) as badges_earned
      FROM coaching_sessions cs
      LEFT JOIN challenge_completions cc ON cs.id = cc.session_id
      LEFT JOIN player_badges pb ON cs.id = pb.session_id
      WHERE cs.player_id = ${playerId}
    `);
    
    const recentSessions = await db.execute(sql`
      SELECT cs.*, tc.name as center_name, u.display_name as coach_name
      FROM coaching_sessions cs
      JOIN training_centers tc ON cs.center_id = tc.id
      JOIN users u ON cs.coach_id = u.id
      WHERE cs.player_id = ${playerId}
      ORDER BY cs.check_in_time DESC
      LIMIT 5
    `);

    return {
      ...progress[0],
      recentSessions,
      skillProgression: []
    };
  }

  // Calendar operations
  async getWeeklyClassSchedule(centerId: number): Promise<any[]> {
    const templates = await db.execute(sql`
      SELECT 
        ct.*,
        u.display_name as coach_name
      FROM class_templates ct
      JOIN users u ON ct.coach_id = u.id
      WHERE ct.center_id = ${centerId} 
      AND ct.is_active = true
      ORDER BY ct.day_of_week, ct.start_time
    `);
    return templates;
  }

  async getClassesForDate(centerId: number, date: Date): Promise<any[]> {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    const classes = await db.execute(sql`
      SELECT 
        ci.*,
        ct.name,
        ct.description,
        ct.goals,
        ct.skill_level,
        ct.max_participants,
        u.display_name as coach_name,
        COUNT(ce.id) as current_enrollment
      FROM class_instances ci
      JOIN class_templates ct ON ci.template_id = ct.id
      JOIN users u ON ci.coach_id = u.id
      LEFT JOIN class_enrollments ce ON ci.id = ce.class_instance_id 
        AND ce.attendance_status != 'cancelled'
      WHERE ci.center_id = ${centerId}
      AND DATE(ci.class_date) = ${dateStr}
      AND ci.status = 'scheduled'
      GROUP BY ci.id, ct.id, u.id
      ORDER BY ci.start_time
    `);
    return classes;
  }

  async getClassDetails(classId: number): Promise<any> {
    const classDetails = await db.execute(sql`
      SELECT 
        ci.*,
        ct.name,
        ct.description,
        ct.goals,
        ct.skill_level,
        ct.max_participants,
        ct.price_per_session,
        u.display_name as coach_name,
        tc.name as center_name,
        COUNT(ce.id) as current_enrollment
      FROM class_instances ci
      JOIN class_templates ct ON ci.template_id = ct.id
      JOIN users u ON ci.coach_id = u.id
      JOIN training_centers tc ON ci.center_id = tc.id
      LEFT JOIN class_enrollments ce ON ci.id = ce.class_instance_id 
        AND ce.attendance_status != 'cancelled'
      WHERE ci.id = ${classId}
      GROUP BY ci.id, ct.id, u.id, tc.id
    `);
    return classDetails[0];
  }

  async getClassEnrollment(classId: number, playerId: number): Promise<any> {
    const enrollment = await db.execute(sql`
      SELECT * FROM class_enrollments 
      WHERE class_instance_id = ${classId} 
      AND player_id = ${playerId}
      AND attendance_status != 'cancelled'
    `);
    return enrollment[0];
  }

  async enrollInClass(enrollment: any): Promise<any> {
    const [newEnrollment] = await db.execute(sql`
      INSERT INTO class_enrollments 
      (class_instance_id, player_id, enrollment_type)
      VALUES (${enrollment.classInstanceId}, ${enrollment.playerId}, ${enrollment.enrollmentType})
      RETURNING *
    `);

    // Update class enrollment count
    await db.execute(sql`
      UPDATE class_instances 
      SET current_enrollment = current_enrollment + 1
      WHERE id = ${enrollment.classInstanceId}
    `);

    return newEnrollment;
  }

  async cancelClassEnrollment(classId: number, playerId: number): Promise<boolean> {
    const result = await db.execute(sql`
      UPDATE class_enrollments 
      SET attendance_status = 'cancelled'
      WHERE class_instance_id = ${classId} 
      AND player_id = ${playerId}
      AND attendance_status != 'cancelled'
    `);

    if (result.rowCount > 0) {
      // Update class enrollment count
      await db.execute(sql`
        UPDATE class_instances 
        SET current_enrollment = current_enrollment - 1
        WHERE id = ${classId}
      `);
      return true;
    }
    return false;
  }

  async getUserEnrolledClasses(playerId: number, upcomingOnly: boolean): Promise<any[]> {
    const timeFilter = upcomingOnly ? sql`AND ci.start_time > NOW()` : sql``;
    
    const classes = await db.execute(sql`
      SELECT 
        ci.*,
        ct.name,
        ct.description,
        ct.goals,
        u.display_name as coach_name,
        tc.name as center_name,
        ce.enrollment_type,
        ce.enrolled_at,
        ce.attendance_status
      FROM class_enrollments ce
      JOIN class_instances ci ON ce.class_instance_id = ci.id
      JOIN class_templates ct ON ci.template_id = ct.id
      JOIN users u ON ci.coach_id = u.id
      JOIN training_centers tc ON ci.center_id = tc.id
      WHERE ce.player_id = ${playerId}
      AND ce.attendance_status != 'cancelled'
      ${timeFilter}
      ORDER BY ci.start_time
    `);
    return classes;
  }

  async createClassTemplate(template: any): Promise<any> {
    const [newTemplate] = await db.execute(sql`
      INSERT INTO class_templates 
      (center_id, coach_id, name, description, category, skill_level, 
       max_participants, duration, price_per_session, goals, 
       day_of_week, start_time, end_time)
      VALUES (${template.centerId}, ${template.coachId}, ${template.name}, 
              ${template.description}, ${template.category}, ${template.skillLevel},
              ${template.maxParticipants}, ${template.duration}, ${template.pricePerSession},
              ${JSON.stringify(template.goals)}, ${template.dayOfWeek}, 
              ${template.startTime}, ${template.endTime})
      RETURNING *
    `);
    return newTemplate;
  }

  async generateClassInstances(templateId: number, startDate: Date, endDate: Date, skipDates: Date[]): Promise<any[]> {
    // Get template details
    const template = await db.execute(sql`
      SELECT * FROM class_templates WHERE id = ${templateId}
    `);
    
    if (!template[0]) return [];
    
    const templateData = template[0];
    const instances = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (current.getDay() === templateData.day_of_week) {
        const shouldSkip = skipDates.some(skipDate => 
          skipDate.toDateString() === current.toDateString()
        );
        
        if (!shouldSkip) {
          const startTime = new Date(current);
          const [hours, minutes] = templateData.start_time.split(':');
          startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + templateData.duration);

          const [instance] = await db.execute(sql`
            INSERT INTO class_instances 
            (template_id, center_id, coach_id, class_date, start_time, end_time, max_participants)
            VALUES (${templateId}, ${templateData.center_id}, ${templateData.coach_id},
                    ${current.toISOString()}, ${startTime.toISOString()}, ${endTime.toISOString()},
                    ${templateData.max_participants})
            RETURNING *
          `);
          instances.push(instance);
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    return instances;
  }
}

export const storage = new DatabaseStorage();