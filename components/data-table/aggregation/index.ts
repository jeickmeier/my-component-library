/**
 * Aggregation Module
 * 
 * This module provides a system for aggregating data in tables.
 */

// Export core types and registry
export * from './core'

// Export aggregation functions
export * from './functions'

// Import required elements
import { 
  AggregationFunctionRegistry, 
  getGlobalRegistry 
} from './core'

import {
  // Standard functions
  sumAggregation,
  avgAggregation,
  minAggregation,
  maxAggregation,
  countAggregation,
  rangeAggregation,
  uniqueAggregation,
  uniqueCountAggregation,
  medianAggregation,
  
  // Custom functions
  weightedAvgAggregation,
  modeAggregation,
  stdDevAggregation,
  percentileAggregation,
  firstAggregation,
  lastAggregation,
  joinAggregation
} from './functions'

/**
 * Create an aggregation function registry with standard functions
 */
export function createAggregationFunctionRegistry(): AggregationFunctionRegistry {
  const registry = new AggregationFunctionRegistry()
  
  // Register standard functions
  registry.register('sum', sumAggregation, { label: 'Sum', description: 'Sum of values' })
  registry.register('mean', avgAggregation, { label: 'Average', description: 'Average of values' })
  registry.register('min', minAggregation, { label: 'Minimum', description: 'Minimum value' })
  registry.register('max', maxAggregation, { label: 'Maximum', description: 'Maximum value' })
  registry.register('count', countAggregation, { label: 'Count', description: 'Count of rows' })
  registry.register('range', rangeAggregation, { label: 'Range', description: 'Range of values (min - max)' })
  registry.register('unique', uniqueAggregation, { label: 'Unique Values', description: 'List of unique values' })
  registry.register('uniqueCount', uniqueCountAggregation, { label: 'Unique Count', description: 'Count of unique values' })
  registry.register('median', medianAggregation, { label: 'Median', description: 'Median value' })
  
  // Register custom functions
  registry.register('weightedAvg', weightedAvgAggregation, { 
    label: 'Weighted Average', 
    description: 'Weighted average based on another column'
  })
  registry.register('mode', modeAggregation, { 
    label: 'Mode', 
    description: 'Most frequent value' 
  })
  registry.register('stdDev', stdDevAggregation, { 
    label: 'Standard Deviation', 
    description: 'Standard deviation of values' 
  })
  registry.register('percentile', percentileAggregation, { 
    label: 'Percentile', 
    description: 'Calculate percentile of values' 
  })
  registry.register('first', firstAggregation, { 
    label: 'First', 
    description: 'First value in the group' 
  })
  registry.register('last', lastAggregation, { 
    label: 'Last', 
    description: 'Last value in the group' 
  })
  registry.register('join', joinAggregation, { 
    label: 'Join', 
    description: 'Join values with a separator' 
  })
  
  return registry
}

/**
 * Get or create the global aggregation function registry
 */
export function getGlobalAggregationFunctionRegistry(): AggregationFunctionRegistry {
  return getGlobalRegistry()
} 