/**
 * PKL-278651-ADMIN-0010-REPORT
 * Report Generator Service
 * 
 * This service provides functions to generate report data for the admin dashboard.
 * Note: In a production environment, this would fetch actual data from databases.
 */

import { 
  TimeSeriesData, 
  CategoryData, 
  ComparisonData,
  ReportTimePeriod
} from '../../shared/schema/admin/reports';

/**
 * Generate time series data for reports
 * @param timePeriod The time period for the data points
 * @param metric The name of the metric being measured
 * @returns Array of time series data points
 */
export function generateDemoTimeSeriesData(timePeriod: ReportTimePeriod, metric: string): TimeSeriesData[] {
  const now = new Date();
  const data: TimeSeriesData[] = [];
  let numPoints = 12; // Default for monthly
  let dateIncrement = 0;
  
  // Determine number of data points and increment based on time period
  switch (timePeriod) {
    case ReportTimePeriod.DAY:
      numPoints = 24;
      dateIncrement = 60 * 60 * 1000; // 1 hour in milliseconds
      break;
    case ReportTimePeriod.WEEK:
      numPoints = 7;
      dateIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      break;
    case ReportTimePeriod.MONTH:
      numPoints = 30;
      dateIncrement = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      break;
    case ReportTimePeriod.QUARTER:
      numPoints = 12;
      dateIncrement = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
      break;
    case ReportTimePeriod.YEAR:
      numPoints = 12;
      dateIncrement = 30 * 24 * 60 * 60 * 1000; // ~1 month in milliseconds
      break;
  }
  
  // Generate the data points
  for (let i = numPoints - 1; i >= 0; i--) {
    const pointDate = new Date(now.getTime() - (i * dateIncrement));
    const value = getRealisticValue(metric, i, numPoints);
    
    data.push({
      timestamp: pointDate.toISOString(),
      value,
      label: formatDateLabel(pointDate, timePeriod)
    });
  }
  
  return data;
}

/**
 * Generate categorical data for reports
 * @param metric The name of the metric being measured
 * @returns Array of category data points
 */
export function generateDemoCategoryData(metric: string): CategoryData[] {
  const categories: CategoryData[] = [];
  
  switch (metric) {
    case 'Match Types':
      categories.push(
        { category: 'Singles', value: 356, color: '#FF5722' },
        { category: 'Doubles', value: 578, color: '#2196F3' },
        { category: 'Mixed Doubles', value: 423, color: '#4CAF50' },
        { category: 'Tournament', value: 189, color: '#9C27B0' },
        { category: 'Practice', value: 215, color: '#FF9800' }
      );
      break;
    case 'Rating Distribution':
      categories.push(
        { category: '0-1.9', value: 78, color: '#FFCDD2' },
        { category: '2.0-2.9', value: 156, color: '#EF9A9A' },
        { category: '3.0-3.5', value: 345, color: '#E57373' },
        { category: '3.5-4.0', value: 423, color: '#EF5350' },
        { category: '4.0-4.5', value: 287, color: '#F44336' },
        { category: '4.5-5.0', value: 132, color: '#E53935' },
        { category: '5.0+', value: 67, color: '#C62828' }
      );
      break;
    case 'Event Attendance':
      categories.push(
        { category: 'Tournaments', value: 234, color: '#3F51B5' },
        { category: 'Clinics', value: 312, color: '#009688' },
        { category: 'Social Events', value: 178, color: '#FFC107' },
        { category: 'League Play', value: 267, color: '#795548' }
      );
      break;
    default:
      // Generate some random categories
      for (let i = 0; i < 5; i++) {
        categories.push({
          category: `Category ${i+1}`,
          value: Math.floor(Math.random() * 500) + 100,
          color: getRandomColor()
        });
      }
  }
  
  return categories;
}

/**
 * Generate comparison data for reports
 * @param metric The name of the metric being measured
 * @returns Array of comparison data points
 */
export function generateDemoComparisonData(metric: string): ComparisonData[] {
  const comparisons: ComparisonData[] = [];
  
  switch (metric) {
    case 'Engagement Metrics':
      comparisons.push(
        createComparisonData('Active Users', 1250, 1050),
        createComparisonData('Average Session', 12.5, 10.2),
        createComparisonData('Matches Played', 876, 705),
        createComparisonData('Profile Updates', 342, 289),
        createComparisonData('Social Interactions', 4325, 3980)
      );
      break;
    case 'Performance Metrics':
      comparisons.push(
        createComparisonData('Page Load Time', 1.2, 1.8, true),
        createComparisonData('API Response Time', 0.25, 0.32, true),
        createComparisonData('Error Rate', 0.5, 1.2, true),
        createComparisonData('Database Queries', 23500, 21000),
        createComparisonData('Bandwidth Usage', 42.7, 38.9)
      );
      break;
    default:
      // Generate some random comparisons
      for (let i = 0; i < 5; i++) {
        const current = Math.floor(Math.random() * 1000) + 100;
        const previous = Math.floor(Math.random() * 1000) + 100;
        comparisons.push(createComparisonData(`Metric ${i+1}`, current, previous));
      }
  }
  
  return comparisons;
}

/**
 * Create a comparison data object with calculated changes
 */
function createComparisonData(
  name: string, 
  current: number, 
  previous: number,
  lowerIsBetter = false
): ComparisonData {
  const change = current - previous;
  const percentChange = (change / previous) * 100;
  
  // If lower is better (like load times), invert the sign
  const adjustedPercentChange = lowerIsBetter ? -percentChange : percentChange;
  
  return {
    name,
    current,
    previous,
    percentChange: Number(adjustedPercentChange.toFixed(1))
  };
}

/**
 * Format a date as a label based on the time period
 */
function formatDateLabel(date: Date, timePeriod: ReportTimePeriod): string {
  switch (timePeriod) {
    case ReportTimePeriod.DAY:
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case ReportTimePeriod.WEEK:
      return date.toLocaleDateString([], { weekday: 'short' });
    case ReportTimePeriod.MONTH:
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    case ReportTimePeriod.QUARTER:
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    case ReportTimePeriod.YEAR:
      return date.toLocaleDateString([], { month: 'short' });
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Generate a realistic value for the given metric and position
 */
function getRealisticValue(metric: string, position: number, total: number): number {
  // Base value with some random variation
  const baseValue = 100 + Math.floor(Math.random() * 50);
  
  // Add a trend based on the position
  const trend = position / total;
  
  // Different metrics have different growth patterns
  switch (metric) {
    case 'User Growth':
      // Exponential growth
      return Math.floor(baseValue * (1 + (position / total) * 3));
    case 'Match Activity':
      // Weekend spikes (assuming daily)
      if (position % 7 === 0 || position % 7 === 6) {
        return baseValue * 2;
      }
      return baseValue;
    case 'System Performance':
      // Random spikes and dips
      if (Math.random() > 0.8) {
        return baseValue * (Math.random() > 0.5 ? 2 : 0.5);
      }
      return baseValue;
    default:
      // Linear growth with some randomness
      return Math.floor(baseValue * (1 + trend));
  }
}

/**
 * Generate a random color for charts
 */
function getRandomColor(): string {
  const colors = [
    '#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800',
    '#3F51B5', '#009688', '#FFC107', '#795548', '#607D8B'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}