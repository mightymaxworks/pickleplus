/**
 * PKL-278651-XP-0003-PULSE
 * XP Economy Monitor
 * 
 * This service monitors the health of the XP economy and provides insights
 * for the PicklePulse™ algorithm.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { db } from '../../db';
import { xpTransactions, activityMultipliers, users } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { eq, gte, lte, desc } from 'drizzle-orm/expressions';

export interface XpEconomyStats {
  totalTransactions: number;
  totalXpIssued: number;
  avgXpPerUser: number;
  activityDistribution: Record<string, number>;
  topEarningActivities: Array<{
    activityType: string;
    totalXp: number;
    percentage: number;
  }>;
  dailyXpIssued: Array<{
    date: string;
    amount: number;
  }>;
}

export class XpEconomyMonitor {
  /**
   * Gets comprehensive stats about the XP economy
   */
  async getEconomyStats(days: number = 30): Promise<XpEconomyStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get total transactions and XP issued
      const [totalsResult] = await db
        .select({
          totalTransactions: sql<number>`count(*)`,
          totalXpIssued: sql<number>`sum(${xpTransactions.amount})`
        })
        .from(xpTransactions)
        .where(gte(xpTransactions.timestamp, startDate));
      
      // Get user count
      const [userCountResult] = await db
        .select({
          userCount: sql<number>`count(*)`
        })
        .from(users);
      
      // Calculate average XP per user
      const avgXpPerUser = userCountResult && userCountResult.userCount > 0
        ? Number(totalsResult.totalXpIssued) / Number(userCountResult.userCount)
        : 0;
      
      // Get activity distribution
      const activityDistResult = await db
        .select({
          activityType: xpTransactions.source,
          totalXp: sql<number>`sum(${xpTransactions.amount})`,
          count: sql<number>`count(*)`
        })
        .from(xpTransactions)
        .where(gte(xpTransactions.timestamp, startDate))
        .groupBy(xpTransactions.source);
      
      // Calculate distribution percentages
      const activityDistribution: Record<string, number> = {};
      const topEarningActivities = [];
      
      if (activityDistResult.length > 0) {
        for (const activity of activityDistResult) {
          const percentage = Number(activity.count) / Number(totalsResult.totalTransactions);
          activityDistribution[activity.activityType] = Math.round(percentage * 1000) / 10; // as percentage
          
          topEarningActivities.push({
            activityType: activity.activityType,
            totalXp: Number(activity.totalXp),
            percentage: Math.round(percentage * 1000) / 10 // as percentage
          });
        }
      }
      
      // Sort top earning activities
      topEarningActivities.sort((a, b) => b.totalXp - a.totalXp);
      
      // Get daily XP issued
      const dailyXpResult = await db
        .select({
          date: sql<string>`date_trunc('day', ${xpTransactions.timestamp})`,
          amount: sql<number>`sum(${xpTransactions.amount})`
        })
        .from(xpTransactions)
        .where(gte(xpTransactions.timestamp, startDate))
        .groupBy(sql`date_trunc('day', ${xpTransactions.timestamp})`)
        .orderBy(sql`date_trunc('day', ${xpTransactions.timestamp})`);
      
      const dailyXpIssued = dailyXpResult.map(item => ({
        date: new Date(item.date).toISOString().split('T')[0],
        amount: Number(item.amount)
      }));
      
      return {
        totalTransactions: Number(totalsResult.totalTransactions) || 0,
        totalXpIssued: Number(totalsResult.totalXpIssued) || 0,
        avgXpPerUser: Math.round(avgXpPerUser * 10) / 10,
        activityDistribution,
        topEarningActivities,
        dailyXpIssued
      };
    } catch (error) {
      console.error('[XP Economy] Error getting economy stats:', error);
      return {
        totalTransactions: 0,
        totalXpIssued: 0,
        avgXpPerUser: 0,
        activityDistribution: {},
        topEarningActivities: [],
        dailyXpIssued: []
      };
    }
  }
  
  /**
   * Gets the current health status of the XP economy
   */
  async getEconomyHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: Record<string, number>;
  }> {
    try {
      const stats = await this.getEconomyStats(7); // Last 7 days
      const issues: string[] = [];
      const metrics: Record<string, number> = {};
      
      // Get all multipliers
      const multipliers = await db
        .select()
        .from(activityMultipliers);
      
      // Check for balance issues
      const activityTypes = Object.keys(stats.activityDistribution);
      
      // Calculate balance metrics
      let maxPercentage = 0;
      let dominantActivity = '';
      let totalDeviation = 0;
      let deviationCount = 0;
      
      for (const activity of activityTypes) {
        const percentage = stats.activityDistribution[activity];
        
        // Find dominant activity
        if (percentage > maxPercentage) {
          maxPercentage = percentage;
          dominantActivity = activity;
        }
        
        // Find matching multiplier
        const multiplier = multipliers.find(m => m.activityType === activity);
        if (multiplier) {
          const targetPercentage = multiplier.targetRatio * 100;
          const deviation = Math.abs(percentage - targetPercentage);
          
          totalDeviation += deviation;
          deviationCount++;
          
          // Check for significant deviation
          if (deviation > 15) {
            issues.push(`${activity} activity is ${percentage > targetPercentage ? 'over-represented' : 'under-represented'} (${percentage}% vs target ${targetPercentage}%)`);
          }
        }
      }
      
      // Calculate average deviation
      const avgDeviation = deviationCount > 0 ? totalDeviation / deviationCount : 0;
      metrics.averageDeviation = Math.round(avgDeviation * 10) / 10;
      
      // Check for dominant activity issue
      if (maxPercentage > 50) {
        issues.push(`${dominantActivity} dominates XP earnings at ${maxPercentage}% of all activities`);
      }
      
      // Determine overall health status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (issues.length > 2 || avgDeviation > 20) {
        status = 'critical';
      } else if (issues.length > 0 || avgDeviation > 10) {
        status = 'warning';
      }
      
      return {
        status,
        issues,
        metrics: {
          dominantActivityPercentage: Math.round(maxPercentage * 10) / 10,
          averageDeviation: Math.round(avgDeviation * 10) / 10,
          issueCount: issues.length
        }
      };
    } catch (error) {
      console.error('[XP Economy] Error getting health status:', error);
      return {
        status: 'warning',
        issues: ['Unable to analyze economy health due to an error'],
        metrics: {}
      };
    }
  }
  
  /**
   * Gets recent multiplier recalibrations for monitoring
   */
  async getRecentRecalibrations(limit: number = 10) {
    try {
      // This would query the multiplierRecalibrations table
      // For simplicity, return a placeholder result
      return [];
    } catch (error) {
      console.error('[XP Economy] Error getting recent recalibrations:', error);
      return [];
    }
  }
}

export default XpEconomyMonitor;