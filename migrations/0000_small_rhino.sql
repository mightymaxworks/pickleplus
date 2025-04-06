CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"xp_reward" integer NOT NULL,
	"image_url" text,
	"category" text NOT NULL,
	"requirement" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"xp_earned" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "coaching_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"access_type" text NOT NULL,
	"access_granted_at" timestamp DEFAULT now(),
	"is_pcp_certified" boolean DEFAULT false,
	"is_admin_verified" boolean DEFAULT false,
	"years_coaching" integer,
	"certifications" json DEFAULT '[]'::json,
	"teaching_philosophy" text,
	"hourly_rate" numeric(10, 2),
	"package_pricing" json DEFAULT '[]'::json,
	"specializations" json DEFAULT '[]'::json,
	"coaching_formats" json DEFAULT '[]'::json,
	"country" text,
	"state_province" text,
	"city" text,
	"facilities" json DEFAULT '[]'::json,
	"travel_radius" integer,
	"availability_schedule" json DEFAULT '{}'::json,
	"accepting_new_students" boolean DEFAULT true,
	"student_successes" json DEFAULT '[]'::json,
	"contact_preferences" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "coaching_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"notes" text,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_one_id" integer NOT NULL,
	"player_two_id" integer NOT NULL,
	"player_one_partner_id" integer,
	"player_two_partner_id" integer,
	"winner_id" integer NOT NULL,
	"score_player_one" text NOT NULL,
	"score_player_two" text NOT NULL,
	"points_awarded" integer NOT NULL,
	"xp_awarded" integer NOT NULL,
	"match_type" text NOT NULL,
	"format_type" text DEFAULT 'singles' NOT NULL,
	"scoring_system" text DEFAULT 'traditional' NOT NULL,
	"points_to_win" integer DEFAULT 11 NOT NULL,
	"tournament_id" integer,
	"event_tier" text,
	"stage_type" text,
	"round_number" integer,
	"is_first_round" boolean DEFAULT false,
	"is_final" boolean DEFAULT false,
	"is_semi_final" boolean DEFAULT false,
	"match_date" timestamp DEFAULT now(),
	"location" text,
	"notes" text,
	"game_scores" json DEFAULT '[]'::json,
	"division" text,
	"score_point_differential" integer,
	"match_quality_multiplier" numeric(3, 2) DEFAULT '1.00'
);
--> statement-breakpoint
CREATE TABLE "ranking_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"old_ranking" integer NOT NULL,
	"new_ranking" integer NOT NULL,
	"reason" text NOT NULL,
	"match_id" integer,
	"tournament_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "redemption_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"xp_reward" integer NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"is_founding_member_code" boolean DEFAULT false,
	"is_coach_access_code" boolean DEFAULT false,
	"code_type" text DEFAULT 'xp',
	"multiplier_value" integer DEFAULT 100,
	"multiplier_duration_days" integer,
	"max_redemptions" integer,
	"current_redemptions" integer DEFAULT 0,
	"expires_at" timestamp,
	CONSTRAINT "redemption_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tournament_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tournament_id" integer NOT NULL,
	"division" text,
	"status" text DEFAULT 'registered',
	"checked_in" boolean DEFAULT false NOT NULL,
	"placement" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"location" text NOT NULL,
	"description" text,
	"image_url" text,
	"has_qualifying" boolean DEFAULT false,
	"has_round_robin" boolean DEFAULT false,
	"has_consolation" boolean DEFAULT false,
	"knockout_rounds" integer DEFAULT 1,
	"event_tier" text DEFAULT 'local',
	"max_participants" integer
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"unlocked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code_id" integer NOT NULL,
	"redeemed_at" timestamp DEFAULT now(),
	"multiplier_expires_at" timestamp,
	"is_multiplier_active" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"display_name" text NOT NULL,
	"year_of_birth" integer,
	"passport_id" text,
	"location" text,
	"playing_since" text,
	"skill_level" text,
	"level" integer DEFAULT 1,
	"xp" integer DEFAULT 0,
	"ranking_points" integer DEFAULT 0,
	"last_match_date" timestamp,
	"avatar_initials" text NOT NULL,
	"total_matches" integer DEFAULT 0,
	"matches_won" integer DEFAULT 0,
	"total_tournaments" integer DEFAULT 0,
	"is_founding_member" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"xp_multiplier" integer DEFAULT 100,
	"bio" text,
	"preferred_position" text,
	"paddle_brand" text,
	"paddle_model" text,
	"playing_style" text,
	"shot_strengths" text,
	"preferred_format" text,
	"dominant_hand" text,
	"regular_schedule" text,
	"looking_for_partners" boolean DEFAULT false,
	"partner_preferences" text,
	"player_goals" text,
	"coach" text,
	"clubs" text,
	"leagues" text,
	"social_handles" json,
	"willing_to_mentor" boolean DEFAULT false,
	"mobility_limitations" text,
	"preferred_match_duration" text,
	"fitness_level" text,
	"profile_completion_pct" integer DEFAULT 0,
	"profile_last_updated" timestamp,
	"profile_setup_step" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_passport_id_unique" UNIQUE("passport_id")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_profiles" ADD CONSTRAINT "coaching_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_one_id_users_id_fk" FOREIGN KEY ("player_one_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_two_id_users_id_fk" FOREIGN KEY ("player_two_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_one_partner_id_users_id_fk" FOREIGN KEY ("player_one_partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_two_partner_id_users_id_fk" FOREIGN KEY ("player_two_partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_history" ADD CONSTRAINT "ranking_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_history" ADD CONSTRAINT "ranking_history_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_history" ADD CONSTRAINT "ranking_history_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_registrations" ADD CONSTRAINT "tournament_registrations_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_redemptions" ADD CONSTRAINT "user_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_redemptions" ADD CONSTRAINT "user_redemptions_code_id_redemption_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."redemption_codes"("id") ON DELETE no action ON UPDATE no action;