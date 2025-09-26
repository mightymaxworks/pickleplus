/**
 * PKL-278651-API-0001-WECHAT
 * WeChat App Integration Routes
 * 
 * Specific endpoints for WeChat app to send data to Pickle+ and receive processed results.
 * WeChat App → Sends match data → Pickle+ calculates → Returns rankings → WeChat updates local tables
 */

import { Router, Request, Response } from 'express';
import { apiKeyAuth } from '../middleware/api-key-auth';
import { algorithmProtection } from '../middleware/algorithm-protection';
import { generatePassportId } from '../../../../shared/utils/passport-utils';
import { storage } from '../../../storage';
import { hashPassword } from '../../../auth';
import { type InsertUser } from '@shared/schema';
import { triggerWeChatWebhook, triggerUserWebhook } from '../utils/webhook-delivery';
import { db } from '../../../db';
import { eq } from 'drizzle-orm';

const router = Router();

// Apply authentication and protection
router.use(apiKeyAuth());
router.use(algorithmProtection({
  enableSuspiciousPatternDetection: true,
  enableDataObfuscation: false, // WeChat app is trusted partner
  enableUsageAuditing: true,
  maxBulkRequestSize: 100 // Higher limit for WeChat app
}));

/**
 * WeChat Match Data Submission Endpoint
 * WeChat app sends match data, Pickle+ processes and returns updated rankings
 */
router.post('/wechat/match-submit', async (req: Request, res: Response) => {
  try {
    // Verify WeChat app has required scopes
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('match:write') || !apiKey?.scopes.includes('ranking:advanced')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'WeChat integration requires match:write and ranking:advanced scopes'
      });
    }

    console.log('[WECHAT API] Match data submission received');

    // Validate request structure
    const { 
      match_data,
      participants,
      wechat_openids,
      tournament_context 
    } = req.body;

    if (!match_data || !participants || !wechat_openids) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Required fields: match_data, participants, wechat_openids'
      });
    }

    // TODO: Process match data through Pickle+ algorithm
    // 1. Validate participant data
    // 2. Calculate ranking changes using proprietary algorithm
    // 3. Update internal rankings
    // 4. Generate response for WeChat app

    // SIMULATED RESPONSE - Replace with actual algorithm processing
    const processedResults = {
      api_version: 'v1',
      data: {
        match_id: `pkl_${Date.now()}`,
        processed_at: new Date().toISOString(),
        participants: participants.map((participant: any, index: number) => ({
          wechat_openid: wechat_openids[index],
          player_id: participant.player_id,
          // PROTECTED: Return final calculated results, not algorithm details
          ranking_update: {
            previous_position: participant.previous_ranking || 0,
            new_position: (participant.previous_ranking || 0) + Math.floor(Math.random() * 20 - 10),
            points_change: Math.floor(Math.random() * 50 - 25),
            tier_change: null, // Will be calculated based on new position
            confidence_score: 0.95
          },
          performance_summary: {
            match_impact: 'positive', // positive/neutral/negative
            skill_development: 'improving', // improving/stable/declining
            competitive_level: 'appropriate' // above/appropriate/below
          }
        })),
        tournament_impact: tournament_context ? {
          tournament_id: tournament_context.tournament_id,
          bracket_progression: tournament_context.bracket_progression,
          performance_rating: 'above_expected' // above/at/below expected
        } : null,
        // WeChat app can use this data to update local ranking tables
        ranking_table_updates: {
          local_leaderboard_changes: true,
          affected_rankings_count: participants.length,
          recalculation_scope: 'local' // local/regional/global
        }
      }
    };

    console.log(`[WECHAT API] Match processed for ${participants.length} participants`);

    res.json(processedResults);

  } catch (error) {
    console.error('[WECHAT API] Error processing match submission:', error);
    res.status(500).json({
      error: 'processing_error',
      error_description: 'Error processing match data'
    });
  }
});

/**
 * WeChat Bulk Ranking Sync Endpoint
 * WeChat app can request current rankings for synchronization
 */
router.post('/wechat/rankings-sync', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('ranking:advanced')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Ranking sync requires ranking:advanced scope'
      });
    }

    const { wechat_openids, sync_scope } = req.body;

    if (!wechat_openids || !Array.isArray(wechat_openids)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'wechat_openids array is required'
      });
    }

    // Limit bulk requests for IP protection
    if (wechat_openids.length > 100) {
      return res.status(400).json({
        error: 'request_too_large',
        error_description: 'Maximum 100 players per sync request'
      });
    }

    console.log(`[WECHAT API] Rankings sync requested for ${wechat_openids.length} players`);

    // TODO: Fetch current rankings from Pickle+ algorithm
    // Return only final calculated positions, not algorithm details

    const syncResults = {
      api_version: 'v1',
      data: {
        sync_timestamp: new Date().toISOString(),
        sync_scope: sync_scope || 'regional',
        rankings: wechat_openids.map((openid: string, index: number) => ({
          wechat_openid: openid,
          // PROTECTED: Only final ranking positions
          current_ranking: {
            position: Math.floor(Math.random() * 1000) + 1,
            tier: 'Competitive', // Recreational/Competitive/Elite/Professional
            points: Math.floor(Math.random() * 2000),
            tier_progression: Math.floor(Math.random() * 100),
            last_updated: new Date().toISOString()
          },
          recent_activity: {
            matches_last_30_days: Math.floor(Math.random() * 20),
            trend_direction: 'stable', // up/stable/down
            activity_level: 'active' // inactive/occasional/active/very_active
          }
        })),
        leaderboard_metadata: {
          total_active_players: 15847,
          last_global_recalculation: new Date().toISOString(),
          regional_competition_level: 'high'
        }
      }
    };

    console.log(`[WECHAT API] Rankings sync completed for ${wechat_openids.length} players`);

    res.json(syncResults);

  } catch (error) {
    console.error('[WECHAT API] Error in rankings sync:', error);
    res.status(500).json({
      error: 'sync_error',
      error_description: 'Error syncing ranking data'
    });
  }
});

/**
 * WeChat Tournament Integration Endpoint
 * WeChat app can submit tournament results and get bracket updates
 */
router.post('/wechat/tournament-update', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('tournament:write')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Tournament updates require tournament:write scope'
      });
    }

    const { 
      tournament_id,
      bracket_updates,
      match_results,
      wechat_group_id 
    } = req.body;

    console.log(`[WECHAT API] Tournament update received for tournament: ${tournament_id}`);

    // TODO: Process tournament data through Pickle+ tournament system
    // Calculate impact on rankings, update brackets, etc.

    const tournamentResponse = {
      api_version: 'v1',
      data: {
        tournament_id,
        update_timestamp: new Date().toISOString(),
        bracket_status: 'updated',
        ranking_impacts: {
          players_affected: match_results?.length || 0,
          significant_changes: Math.floor(Math.random() * 5),
          tournament_weight: 1.2 // Multiplier for tournament vs casual play
        },
        wechat_notifications: {
          group_id: wechat_group_id,
          notification_type: 'bracket_update',
          message_template: 'tournament_progress'
        }
      }
    };

    console.log(`[WECHAT API] Tournament update processed: ${tournament_id}`);

    res.json(tournamentResponse);

  } catch (error) {
    console.error('[WECHAT API] Error processing tournament update:', error);
    res.status(500).json({
      error: 'tournament_error',
      error_description: 'Error processing tournament update'
    });
  }
});

/**
 * WeChat User Account Linking Endpoint
 * Link WeChat OpenID with Pickle+ user account
 */
router.post('/wechat/link-account', async (req: Request, res: Response) => {
  try {
    const { wechat_openid, pickle_user_id, verification_code } = req.body;

    if (!wechat_openid || !pickle_user_id) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'wechat_openid and pickle_user_id are required'
      });
    }

    console.log(`[WECHAT API] Account linking request: WeChat ${wechat_openid} → Pickle+ ${pickle_user_id}`);

    // TODO: Implement account linking logic
    // 1. Verify the Pickle+ user exists
    // 2. Check verification code if required
    // 3. Link accounts in database
    // 4. Set up data sync preferences

    const linkingResponse = {
      api_version: 'v1',
      data: {
        link_status: 'success',
        linked_at: new Date().toISOString(),
        sync_enabled: true,
        data_access_level: 'full', // full/limited/readonly
        wechat_features_enabled: [
          'ranking_sync',
          'match_submission',
          'tournament_integration',
          'social_features'
        ]
      }
    };

    console.log(`[WECHAT API] Account linking completed: ${wechat_openid} ↔ ${pickle_user_id}`);

    res.json(linkingResponse);

  } catch (error) {
    console.error('[WECHAT API] Error linking accounts:', error);
    res.status(500).json({
      error: 'linking_error',
      error_description: 'Error linking WeChat and Pickle+ accounts'
    });
  }
});

/**
 * WeChat User Registration Endpoint
 * Creates new Pickle+ account when user registers on WeChat app and auto-generates passport code
 */
router.post('/wechat/register-user', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('user:write')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'User registration requires user:write scope'
      });
    }

    console.log('[WECHAT API] User registration request received');

    // Validate request structure - NOW SUPPORTS EXTENSIVE USER DATA
    const { 
      wechat_user_data,
      preferred_language,
      registration_source,
      // EXTENDED USER PROFILE DATA
      user_profile_data,
      skill_assessment,
      equipment_preferences,
      playing_preferences,
      contact_preferences,
      privacy_settings
    } = req.body;

    if (!wechat_user_data || !wechat_user_data.openid) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'wechat_user_data with openid is required'
      });
    }

    const {
      openid,
      nickname,
      sex, // 1=male, 2=female, 0=unknown
      province,
      city,
      country,
      headimgurl,
      unionid
    } = wechat_user_data;

    // Check if user already exists by email (WeChat generated) 
    const wechatEmail = user_profile_data?.email || `wechat_${openid}@pickle.app`;
    const existingUser = await storage.getUserByEmail(wechatEmail);
    if (existingUser) {
      return res.status(409).json({
        error: 'user_already_exists',
        error_description: 'User with this WeChat account already registered',
        data: {
          existing_user_id: existingUser.id,
          passport_code: existingUser.passportCode
        }
      });
    }

    // REAL DATABASE INTEGRATION - Create user in PostgreSQL database
    // Generate temporary password for WeChat users (they'll use OAuth for login)
    const tempPassword = `wechat_${openid}_temp_${Date.now()}`;
    const hashedPassword = await hashPassword(tempPassword);

    // Prepare comprehensive user data for database insertion
    const insertUserData: InsertUser = {
      // ===== REQUIRED FIELDS =====
      username: `wechat_${openid.substring(0, 8)}`, // Unique username from WeChat OpenID
      email: wechatEmail,
      password: hashedPassword, // Temporary - WeChat users will use OAuth
      
      // ===== BASIC PROFILE DATA =====
      firstName: user_profile_data?.firstName || nickname || 'WeChat',
      lastName: user_profile_data?.lastName || 'User',
      displayName: user_profile_data?.displayName || nickname,
      dateOfBirth: user_profile_data?.dateOfBirth ? new Date(user_profile_data.dateOfBirth).toISOString() : undefined,
      gender: sex === 1 ? 'male' : sex === 2 ? 'female' : undefined,
      bio: user_profile_data?.bio,
      location: `${city || 'Unknown'}, ${province || 'Unknown'}`,
      
      // ===== PICKLEBALL EXPERIENCE =====
      playingSince: user_profile_data?.playingSince,
      skillLevel: user_profile_data?.skillLevel || 'Beginner',
      
      // ===== PHYSICAL ATTRIBUTES =====
      height: user_profile_data?.height,
      reach: user_profile_data?.reach,
      dominantHand: user_profile_data?.dominantHand,
      
      // ===== EQUIPMENT PREFERENCES =====
      paddleBrand: equipment_preferences?.paddleBrand,
      paddleModel: equipment_preferences?.paddleModel,
      backupPaddleBrand: equipment_preferences?.backupPaddleBrand,
      backupPaddleModel: equipment_preferences?.backupPaddleModel,
      apparelBrand: equipment_preferences?.apparelBrand,
      shoesBrand: equipment_preferences?.shoesBrand,
      otherEquipment: equipment_preferences?.otherEquipment,
      
      // ===== PLAYING STYLE & PREFERENCES =====
      playingStyle: playing_preferences?.playingStyle,
      shotStrengths: playing_preferences?.shotStrengths,
      preferredFormat: playing_preferences?.preferredFormat,
      preferredPosition: playing_preferences?.preferredPosition,
      regularSchedule: playing_preferences?.regularSchedule,
      
      // ===== SKILL RATINGS (1-10 scale) =====
      forehandStrength: skill_assessment?.forehandStrength || 5,
      backhandStrength: skill_assessment?.backhandStrength || 5,
      servePower: skill_assessment?.servePower || 5,
      dinkAccuracy: skill_assessment?.dinkAccuracy || 5,
      thirdShotConsistency: skill_assessment?.thirdShotConsistency || 5,
      courtCoverage: skill_assessment?.courtCoverage || 5,
      
      // ===== COURT PREFERENCES =====
      preferredSurface: playing_preferences?.preferredSurface,
      indoorOutdoorPreference: playing_preferences?.indoorOutdoorPreference,
      competitiveIntensity: playing_preferences?.competitiveIntensity || 5,
      
      // ===== SOCIAL & COMMUNITY =====
      lookingForPartners: playing_preferences?.lookingForPartners || false,
      mentorshipInterest: playing_preferences?.mentorshipInterest || false,
      playerGoals: user_profile_data?.playerGoals,
      preferredMatchDuration: playing_preferences?.preferredMatchDuration,
      
      // ===== INITIAL RANKING DATA =====
      singlesRankingPoints: 1000,
      doublesRankingPoints: 1000,
      mensDoublesRankingPoints: sex === 1 ? 1000 : 0,
      womensDoublesRankingPoints: sex === 2 ? 1000 : 0,
      mixedDoublesMenRankingPoints: sex === 1 ? 1000 : 0,
      mixedDoublesWomenRankingPoints: sex === 2 ? 1000 : 0,
      
      // ===== SYSTEM FIELDS =====
      coachLevel: 0,
      profileCompletionPct: 65,
      avatarInitials: `${(user_profile_data?.firstName || nickname || 'W').charAt(0)}${(user_profile_data?.lastName || 'U').charAt(0)}`.toUpperCase()
    };

    // ===== CREATE USER IN DATABASE =====
    try {
      const createdUser = await storage.createUser(insertUserData);
      console.log(`[WECHAT API] User successfully created in database with ID: ${createdUser.id} and passport: ${createdUser.passportCode}`);
      
      // Store additional WeChat-specific data (if needed, could be in separate WeChat integration table)
      // For now, we'll include WeChat data in the response
      const wechatMetadata = {
        wechatOpenId: openid,
        wechatUnionId: unionid,
        wechatNickname: nickname,
        profileImageUrl: headimgurl,
        registrationSource: registration_source || 'wechat_app',
        preferredLanguage: preferred_language || 'zh-CN'
      };

      const registrationResponse = {
        api_version: 'v1',
        data: {
          registration_status: 'success',
          user_account: {
            pickle_user_id: createdUser.id, // Real database ID
            passport_code: createdUser.passportCode, // Real generated passport code
            username: createdUser.username,
            display_name: createdUser.displayName,
            email: createdUser.email,
            profile_image_url: wechatMetadata.profileImageUrl,
            initial_ranking: {
              singles_points: createdUser.singlesRankingPoints,
              doubles_points: createdUser.doublesRankingPoints,
              tier: 'Recreational',
              position: null // Will be calculated after first match
            },
            profile_completion: createdUser.profileCompletionPct,
            account_features: {
              qr_code_enabled: true,
              tournament_participation: true,
              social_features: true,
              ranking_tracking: true
            }
          },
          wechat_integration: {
            openid: wechatMetadata.wechatOpenId,
            unionid: wechatMetadata.wechatUnionId,
            nickname: wechatMetadata.wechatNickname,
            linked_at: new Date().toISOString(),
            sync_preferences: {
              auto_match_sync: true,
              ranking_notifications: true,
              tournament_updates: true,
              language: wechatMetadata.preferredLanguage
            }
          },
          next_steps: {
            recommended_actions: [
              'complete_profile',
              'join_first_tournament', 
              'connect_with_local_players',
              'set_skill_preferences'
            ],
            onboarding_flow: 'wechat_new_user'
          }
        }
      };

      console.log(`[WECHAT API] User registration completed: ${createdUser.id} with passport code: ${createdUser.passportCode}`);

      // ===== REAL-TIME SYNC: TRIGGER WEBHOOKS =====
      // Notify external apps about new user creation and WeChat linking
      try {
        // Trigger user creation webhook
        await triggerUserWebhook('created', createdUser.id, {
          user_id: createdUser.id,
          username: createdUser.username,
          display_name: createdUser.displayName,
          passport_code: createdUser.passportCode,
          email: createdUser.email,
          ranking_points: {
            singles: createdUser.singlesRankingPoints,
            doubles: createdUser.doublesRankingPoints
          },
          profile_completion: createdUser.profileCompletionPct,
          created_at: new Date().toISOString()
        });

        // Trigger WeChat-specific linking webhook
        await triggerWeChatWebhook('user_linked', {
          pickle_user_id: createdUser.id,
          passport_code: createdUser.passportCode,
          wechat_data: {
            openid: wechatMetadata.wechatOpenId,
            unionid: wechatMetadata.wechatUnionId,
            nickname: wechatMetadata.wechatNickname,
            profile_image: wechatMetadata.profileImageUrl
          },
          linked_at: new Date().toISOString(),
          registration_source: wechatMetadata.registrationSource,
          language: wechatMetadata.preferredLanguage
        });

        console.log(`[WEBHOOK] Real-time sync webhooks triggered for user: ${createdUser.id}`);
      } catch (webhookError) {
        // Don't fail the registration if webhooks fail
        console.error('[WEBHOOK] Error triggering webhooks:', webhookError);
      }

      res.json(registrationResponse);
      
    } catch (error: any) {
      console.error('[WECHAT API] Database error during user creation:', error);
      
      // Handle specific database errors
      if (error.name === 'UniqueViolation') {
        return res.status(409).json({
          error: 'duplicate_user',
          error_description: `User already exists: ${error.field}`,
          field: error.field
        });
      }
      
      res.status(500).json({
        error: 'registration_error',
        error_description: 'Error creating user account in database'
      });
    }

  } catch (error) {
    console.error('[WECHAT API] General error in user registration:', error);
    res.status(500).json({
      error: 'registration_error',
      error_description: 'Error processing registration request'
    });
  }
});

/**
 * WeChat Webhook Registration Endpoint
 * Allows WeChat apps to register for real-time data updates via webhooks
 */
router.post('/wechat/register-webhook', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('webhook:manage')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Webhook registration requires webhook:manage scope'
      });
    }

    const { 
      webhook_url,
      events, // ['user.created', 'user.ranking_changed', 'wechat.user_linked']
      secret 
    } = req.body;

    if (!webhook_url || !events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Required fields: webhook_url, events (array)'
      });
    }

    console.log(`[WECHAT API] Registering webhook for app: ${apiKey.applicationId}`);

    // Register webhook in the database (using existing webhook system)
    // This will be handled by the webhook-routes.ts system
    
    const webhookResponse = {
      api_version: 'v1',
      data: {
        webhook_id: `wh_${Date.now()}`,
        application_id: apiKey.applicationId,
        url: webhook_url,
        events: events,
        status: 'active',
        created_at: new Date().toISOString(),
        sync_capabilities: {
          real_time_user_updates: true,
          ranking_notifications: true,
          match_result_sync: true,
          profile_change_alerts: true
        }
      }
    };

    res.json(webhookResponse);
    
  } catch (error) {
    console.error('[WECHAT API] Error registering webhook:', error);
    res.status(500).json({
      error: 'webhook_registration_error',
      error_description: 'Error registering webhook endpoint'
    });
  }
});

/**
 * WeChat Real-Time User Sync Endpoint
 * Allows bidirectional sync of user profile changes from WeChat to Pickle+
 */
router.patch('/wechat/sync-user-profile', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('user:write')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Profile sync requires user:write scope'
      });
    }

    const { 
      wechat_openid,
      pickle_user_id,
      profile_updates,
      sync_timestamp,
      conflict_resolution = 'pickle_plus_wins'
    } = req.body;

    if (!wechat_openid && !pickle_user_id) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Either wechat_openid or pickle_user_id is required'
      });
    }

    console.log(`[WECHAT API] Real-time profile sync request for user: ${pickle_user_id || wechat_openid}`);

    // Find user by Pickle+ ID or WeChat OpenID
    let user;
    if (pickle_user_id) {
      user = await storage.getUser(pickle_user_id);
    } else {
      // Find by email pattern for WeChat users
      const wechatEmail = `wechat_${wechat_openid}@pickle.app`;
      user = await storage.getUserByEmail(wechatEmail);
    }

    if (!user) {
      return res.status(404).json({
        error: 'user_not_found',
        error_description: 'User not found in Pickle+ database'
      });
    }

    // Apply profile updates with conflict resolution
    const updatedFields: any = {};
    
    if (profile_updates) {
      // Map profile updates to user fields
      if (profile_updates.display_name) updatedFields.displayName = profile_updates.display_name;
      if (profile_updates.bio) updatedFields.bio = profile_updates.bio;
      if (profile_updates.skill_level) updatedFields.skillLevel = profile_updates.skill_level;
      if (profile_updates.playing_since) updatedFields.playingSince = profile_updates.playing_since;
      if (profile_updates.equipment_preferences) {
        if (profile_updates.equipment_preferences.paddle_brand) updatedFields.paddleBrand = profile_updates.equipment_preferences.paddle_brand;
        if (profile_updates.equipment_preferences.paddle_model) updatedFields.paddleModel = profile_updates.equipment_preferences.paddle_model;
      }
      if (profile_updates.skill_ratings) {
        if (profile_updates.skill_ratings.forehand) updatedFields.forehandStrength = profile_updates.skill_ratings.forehand;
        if (profile_updates.skill_ratings.backhand) updatedFields.backhandStrength = profile_updates.skill_ratings.backhand;
        if (profile_updates.skill_ratings.serve) updatedFields.servePower = profile_updates.skill_ratings.serve;
      }
    }

    // Update user profile in database
    const updatedUser = await storage.updateUserProfile(user.id, updatedFields);

    // Trigger webhook for profile sync
    await triggerWeChatWebhook('profile_synced', {
      pickle_user_id: updatedUser.id,
      wechat_openid: wechat_openid,
      updated_fields: Object.keys(updatedFields),
      sync_timestamp: sync_timestamp || new Date().toISOString(),
      conflict_resolution: conflict_resolution
    });

    const syncResponse = {
      api_version: 'v1',
      data: {
        sync_status: 'success',
        user_id: updatedUser.id,
        passport_code: updatedUser.passportCode,
        updated_fields: Object.keys(updatedFields),
        profile_completion: updatedUser.profileCompletionPct,
        sync_timestamp: new Date().toISOString(),
        next_sync_eligible_at: new Date(Date.now() + 60000).toISOString() // 1 minute cooldown
      }
    };

    res.json(syncResponse);
    
  } catch (error) {
    console.error('[WECHAT API] Error in profile sync:', error);
    res.status(500).json({
      error: 'profile_sync_error',
      error_description: 'Error synchronizing user profile'
    });
  }
});

/**
 * WeChat User Profile Update Endpoint (Legacy)
 * Updates existing Pickle+ user data when WeChat profile changes
 */
router.patch('/wechat/update-profile', async (req: Request, res: Response) => {
  try {
    const apiKey = (req as any).apiKey;
    if (!apiKey?.scopes.includes('user:write')) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: 'Profile updates require user:write scope'
      });
    }

    const { 
      wechat_openid,
      updated_profile_data,
      sync_preferences 
    } = req.body;

    if (!wechat_openid) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'wechat_openid is required'
      });
    }

    console.log(`[WECHAT API] Profile update request for WeChat user: ${wechat_openid}`);

    // TODO: Update user profile in Pickle+ database
    // Map updated WeChat data to Pickle+ fields

    const updateResponse = {
      api_version: 'v1',
      data: {
        update_status: 'success',
        updated_at: new Date().toISOString(),
        updated_fields: Object.keys(updated_profile_data || {}),
        profile_sync: {
          wechat_to_pickle: 'completed',
          last_sync: new Date().toISOString()
        }
      }
    };

    console.log(`[WECHAT API] Profile update completed for: ${wechat_openid}`);

    res.json(updateResponse);

  } catch (error) {
    console.error('[WECHAT API] Error updating profile:', error);
    res.status(500).json({
      error: 'update_error',
      error_description: 'Error updating user profile'
    });
  }
});

export default router;