/**
 * PKL-278651-OAUTH-001 - OAuth API Database Migration
 * 
 * Creates all necessary tables for the OAuth server functionality.
 * This is a separate migration that doesn't modify any existing tables.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { sql } from 'drizzle-orm';
import { db } from '../server/db';

export async function createOAuthTables() {
  console.log('[OAUTH] Creating OAuth database tables...');

  // Create oauth_clients table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oauth_clients (
      id SERIAL PRIMARY KEY,
      client_id UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
      client_secret TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      website_url TEXT,
      logo_url TEXT,
      privacy_policy_url TEXT,
      terms_of_service_url TEXT,
      redirect_uris TEXT[] NOT NULL,
      allowed_scopes TEXT[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      developer_id INTEGER REFERENCES users(id) NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL,
      token_signing_alg TEXT DEFAULT 'HS256' NOT NULL,
      is_public_client BOOLEAN DEFAULT FALSE NOT NULL,
      verification_notes TEXT,
      verified_at TIMESTAMP,
      verified_by INTEGER REFERENCES users(id)
    );
  `);

  // Create oauth_access_tokens table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oauth_access_tokens (
      id SERIAL PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      client_id UUID REFERENCES oauth_clients(client_id) NOT NULL,
      scopes TEXT[] NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    );
  `);

  // Create oauth_refresh_tokens table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
      id SERIAL PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      access_token_id INTEGER REFERENCES oauth_access_tokens(id) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP,
      replaced_by_token_id INTEGER REFERENCES oauth_refresh_tokens(id)
    );
  `);

  // Create oauth_authorization_codes table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      client_id UUID REFERENCES oauth_clients(client_id) NOT NULL,
      redirect_uri TEXT NOT NULL,
      scopes TEXT[] NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      code_challenge TEXT,
      code_challenge_method TEXT,
      nonce TEXT,
      used BOOLEAN DEFAULT FALSE NOT NULL
    );
  `);

  // Create oauth_user_authorizations table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oauth_user_authorizations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL,
      client_id UUID REFERENCES oauth_clients(client_id) NOT NULL,
      scopes TEXT[] NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      last_used_at TIMESTAMP,
      expires_at TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      revoked_at TIMESTAMP,
      revoked_reason TEXT
    );
  `);

  // Create oauth_developer_profiles table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oauth_developer_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
      company_name TEXT,
      company_website TEXT,
      contact_email TEXT NOT NULL,
      verification_status TEXT DEFAULT 'unverified' NOT NULL,
      verification_document_url TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      verified_at TIMESTAMP,
      verified_by INTEGER REFERENCES users(id)
    );
  `);

  // Create oauth_api_usage_logs table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS oauth_api_usage_logs (
      id SERIAL PRIMARY KEY,
      client_id UUID REFERENCES oauth_clients(client_id) NOT NULL,
      user_id INTEGER REFERENCES users(id),
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      response_time INTEGER,
      rate_limit INTEGER,
      rate_limit_remaining INTEGER
    );
  `);

  // Create indexes for performance
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_user_id ON oauth_access_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_client_id ON oauth_access_tokens(client_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_access_token_id ON oauth_refresh_tokens(access_token_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_authorization_codes_user_id ON oauth_authorization_codes(user_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_authorization_codes_client_id ON oauth_authorization_codes(client_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_user_authorizations_user_id ON oauth_user_authorizations(user_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_user_authorizations_client_id ON oauth_user_authorizations(client_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_api_usage_logs_client_id ON oauth_api_usage_logs(client_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_api_usage_logs_timestamp ON oauth_api_usage_logs(timestamp);
  `);

  console.log('[OAUTH] All OAuth tables created successfully');
}

// Run the migration if this file is executed directly
if (require.main === module) {
  createOAuthTables()
    .then(() => {
      console.log('[OAUTH] Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[OAUTH] Migration failed:', error);
      process.exit(1);
    });
}