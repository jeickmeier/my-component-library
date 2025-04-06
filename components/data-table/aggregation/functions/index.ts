/**
 * Aggregation Functions Index
 * 
 * This module exports all aggregation functions from the categorized modules:
 * - basic: fundamental operations (sum, avg, min, max, count)
 * - statistical: advanced statistical functions (median, stdDev, percentile, etc.)
 * - grouping: functions for working with groups (unique, mode, range)
 * - text: functions for text and sequences (first, last, join)
 */

// Export all function categories
export * from './basic'
export * from './statistical'
export * from './grouping'
export * from './text' 