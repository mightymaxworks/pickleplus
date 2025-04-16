/**
 * PKL-278651-API-0001-GATEWAY
 * API Gateway Migration Runner
 * 
 * This script runs the migration for creating the API Gateway tables
 * Run with: npx tsx run-api-gateway-migration.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

async function main() {
  console.log('Starting API Gateway migration...');
  
  // Connect to the database
  const client = postgres(connectionString);
  const db = drizzle(client);
  
  try {
    // Check if tables already exist
    const tablesExist = await checkTablesExist(db);
    
    if (tablesExist) {
      console.log('API Gateway tables already exist. No changes made.');
      process.exit(0);
    }
    
    // Start transaction
    await db.execute(sql`BEGIN`);
    
    // Create API developer accounts table
    console.log('Creating api_developer_accounts table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_developer_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        company_name VARCHAR(255),
        website VARCHAR(255),
        developer_bio TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        approval_date TIMESTAMP,
        terms_accepted BOOLEAN DEFAULT FALSE,
        terms_accepted_date TIMESTAMP,
        monthly_quota INTEGER DEFAULT 10000,
        developer_tier VARCHAR(50) DEFAULT 'free',
        is_test_account BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create API applications table
    console.log('Creating api_applications table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_applications (
        id SERIAL PRIMARY KEY,
        developer_id INTEGER NOT NULL REFERENCES api_developer_accounts(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        application_url VARCHAR(255),
        callback_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        app_type VARCHAR(50) DEFAULT 'client' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create API keys table
    console.log('Creating api_keys table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES api_applications(id),
        key_prefix VARCHAR(10) NOT NULL,
        key_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) DEFAULT 'Default',
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP,
        last_used TIMESTAMP,
        scopes TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        created_by_ip VARCHAR(50)
      )
    `);
    
    // Create API usage logs table
    console.log('Creating api_usage_logs table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_usage_logs (
        id SERIAL PRIMARY KEY,
        key_id INTEGER REFERENCES api_keys(id),
        endpoint VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        status_code INTEGER NOT NULL,
        request_size INTEGER,
        response_size INTEGER,
        processing_time INTEGER,
        request_ip VARCHAR(50),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        error_code VARCHAR(50),
        parameters JSONB
      )
    `);
    
    // Create API rate limits table
    console.log('Creating api_rate_limits table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_rate_limits (
        id SERIAL PRIMARY KEY,
        developer_tier VARCHAR(50) NOT NULL,
        endpoint VARCHAR(255),
        request_limit INTEGER NOT NULL,
        time_window INTEGER NOT NULL,
        concurrent_limit INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create API documentation table
    console.log('Creating api_documentation table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_documentation (
        id SERIAL PRIMARY KEY,
        endpoint VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        summary VARCHAR(255) NOT NULL,
        description TEXT,
        request_schema JSONB,
        response_schema JSONB,
        auth_required BOOLEAN DEFAULT TRUE,
        required_scopes TEXT,
        deprecated BOOLEAN DEFAULT FALSE,
        version VARCHAR(20) DEFAULT '1.0',
        tags TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create API webhooks table
    console.log('Creating api_webhooks table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_webhooks (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES api_applications(id),
        url VARCHAR(255) NOT NULL,
        events TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        secret VARCHAR(255) NOT NULL,
        failure_count INTEGER DEFAULT 0,
        last_failure TIMESTAMP,
        last_success TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create API webhook delivery logs table
    console.log('Creating api_webhook_delivery_logs table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_webhook_delivery_logs (
        id SERIAL PRIMARY KEY,
        webhook_id INTEGER NOT NULL REFERENCES api_webhooks(id),
        event_type VARCHAR(50) NOT NULL,
        payload_snapshot JSONB,
        status_code INTEGER,
        success BOOLEAN DEFAULT FALSE,
        error_message TEXT,
        attempt_count INTEGER DEFAULT 1,
        delivered_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create indexes for performance
    console.log('Creating indexes...');
    
    // For API keys lookups
    await db.execute(sql`CREATE INDEX idx_api_keys_prefix ON api_keys (key_prefix)`);
    await db.execute(sql`CREATE INDEX idx_api_keys_application_id ON api_keys (application_id)`);
    
    // For usage logs queries
    await db.execute(sql`CREATE INDEX idx_api_usage_logs_key_id ON api_usage_logs (key_id)`);
    await db.execute(sql`CREATE INDEX idx_api_usage_logs_timestamp ON api_usage_logs (timestamp)`);
    await db.execute(sql`CREATE INDEX idx_api_usage_logs_endpoint ON api_usage_logs (endpoint)`);
    
    // For rate limits lookups
    await db.execute(sql`CREATE INDEX idx_api_rate_limits_tier_endpoint ON api_rate_limits (developer_tier, endpoint)`);
    
    // For documentation queries
    await db.execute(sql`CREATE INDEX idx_api_documentation_endpoint_method ON api_documentation (endpoint, method)`);
    
    // For webhook queries
    await db.execute(sql`CREATE INDEX idx_api_webhooks_application_id ON api_webhooks (application_id)`);
    await db.execute(sql`CREATE INDEX idx_api_webhook_delivery_logs_webhook_id ON api_webhook_delivery_logs (webhook_id)`);
    
    // Insert default rate limits
    console.log('Inserting default rate limits...');
    await db.execute(sql`
      INSERT INTO api_rate_limits 
        (developer_tier, endpoint, request_limit, time_window, concurrent_limit)
      VALUES
        ('free', NULL, 100, 60, 5),
        ('basic', NULL, 1000, 60, 10),
        ('professional', NULL, 10000, 60, 20),
        ('enterprise', NULL, 100000, 60, 50)
    `);
    
    // Commit transaction
    await db.execute(sql`COMMIT`);
    
    console.log('API Gateway migration completed successfully.');
  } catch (error) {
    // Rollback transaction on error
    await db.execute(sql`ROLLBACK`);
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await client.end();
  }
}

/**
 * Check if the API Gateway tables already exist
 */
async function checkTablesExist(db: any): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'api_developer_accounts'
      ) as exists
    `);
    return result[0]?.exists || false;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

// Run the migration
main();