/**
 * Aggregation Module
 * 
 * This module provides a comprehensive system for aggregating data in tables. It includes:
 * 
 * - Type definitions for aggregation functions
 * - A registry system for managing aggregation functions
 * - Standard and advanced aggregation functions
 * - Utility functions for common operations
 * 
 * The module is designed to work with TanStack Table but can be used independently.
 * It supports both synchronous and asynchronous aggregation operations.
 * 
 * @module aggregation
 */

// Export type definitions
export * from './types'

// Export registry
export * from './registry'

// Export all aggregation functions
export * from './functions'

// Export utility functions
export * from './utils'

// Import required elements for creating a registry
import { AggregationFunctionRegistry } from './registry'
import {
  // Basic functions
  sumAggregation,
  avgAggregation,
  minAggregation,
  maxAggregation,
  countAggregation,
  
  // Grouping functions
  rangeAggregation,
  uniqueAggregation,
  uniqueCountAggregation,
  modeAggregation,
  listAggregation,
  
  // Statistical functions
  medianAggregation,
  stdDevAggregation,
  percentileAggregation,
  weightedAvgAggregation,
  
  // Text functions
  firstAggregation,
  lastAggregation,
  joinAggregation
} from './functions'

/**
 * Creates a new aggregation function registry pre-loaded with standard functions.
 * 
 * @returns {AggregationFunctionRegistry} A new registry instance with standard functions
 * 
 * @example
 * ```ts
 * const registry = createAggregationFunctionRegistry();
 * const sumFn = registry.get('sum');
 * ```
 */
export function createRegistry(): AggregationFunctionRegistry {
  const registry = new AggregationFunctionRegistry()
  
  // Register basic functions
  registry.register('sum', sumAggregation, { label: 'Sum', description: 'Sum of values' })
  registry.register('mean', avgAggregation, { label: 'Average', description: 'Average of values' })
  registry.register('min', minAggregation, { label: 'Minimum', description: 'Minimum value' })
  registry.register('max', maxAggregation, { label: 'Maximum', description: 'Maximum value' })
  registry.register('count', countAggregation, { label: 'Count', description: 'Count of rows' })
  
  // Register grouping functions
  registry.register('range', rangeAggregation, { label: 'Range', description: 'Range of values (min - max)' })
  registry.register('unique', uniqueAggregation, { label: 'Unique Values', description: 'List of unique values' })
  registry.register('uniqueCount', uniqueCountAggregation, { label: 'Unique Count', description: 'Count of unique values' })
  registry.register('mode', modeAggregation, { label: 'Mode', description: 'Most frequent value' })
  registry.register('list', listAggregation, { label: 'List', description: 'List of all values' })
  
  // Register statistical functions
  registry.register('median', medianAggregation, { label: 'Median', description: 'Median value' })
  registry.register('stdDev', stdDevAggregation, { label: 'Standard Deviation', description: 'Standard deviation of values' })
  registry.register('percentile', percentileAggregation, { label: 'Percentile', description: 'Calculate percentile of values' })
  registry.register('weightedAvg', weightedAvgAggregation, { label: 'Weighted Average', description: 'Weighted average based on another column' })
  
  // Register text functions
  registry.register('first', firstAggregation, { label: 'First', description: 'First value in the group' })
  registry.register('last', lastAggregation, { label: 'Last', description: 'Last value in the group' })
  registry.register('join', joinAggregation, { label: 'Join', description: 'Join values with a separator' })
  
  return registry
}

// For backward compatibility
export const createAggregationFunctionRegistry = createRegistry

// Create and export a default registry instance
export const defaultRegistry = createRegistry()

// For backward compatibility
export const getGlobalAggregationFunctionRegistry = () => defaultRegistry 