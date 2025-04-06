/**
 * Custom Aggregation Functions Module
 * 
 * This module provides advanced aggregation functions that go beyond standard operations.
 * These functions support additional configuration options and provide more complex
 * statistical and data manipulation capabilities.
 */

import { AggregationFunction, WeightedAvgAggregationConfig, PercentileAggregationConfig, JoinAggregationConfig } from "../core"

/**
 * Calculates a weighted average where each value is multiplied by a weight from another column.
 * Requires a weightColumnId in the configuration to specify which column contains the weights.
 * 
 * @example
 * ```ts
 * // Column values: [10, 20, 30]
 * // Weight values: [1, 2, 3]
 * // Config: { weightColumnId: 'weight' }
 * // Returns: 25 ((10*1 + 20*2 + 30*3)/(1 + 2 + 3))
 * ```
 * 
 * @param columnId - The ID of the column containing values
 * @param leafRows - The rows to aggregate
 * @param config - Must include weightColumnId property
 * @returns Weighted average or null if invalid config or no numeric values
 */
export const weightedAvgAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const weightColumnId = (config as WeightedAvgAggregationConfig)?.weightColumnId
  if (!weightColumnId) {
    return null
  }

  let weightedSum = 0
  let totalWeight = 0

  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    const weight = row.getValue(weightColumnId)
    
    if (typeof value === 'number' && typeof weight === 'number') {
      weightedSum += value * weight
      totalWeight += weight
    }
  })

  return totalWeight ? weightedSum / totalWeight : null
}

/**
 * Finds the most frequently occurring value in a column (the statistical mode).
 * If multiple values have the same highest frequency, returns the first one found.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 2, 3, 2, 4, 4]
 * // Returns: 2 (appears 3 times)
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The most frequent value, or null if no values
 */
export const modeAggregation: AggregationFunction = (columnId, leafRows) => {
  const countMap = new Map<unknown, number>()
  
  // Count occurrences
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (value !== undefined && value !== null) {
      countMap.set(value, (countMap.get(value) || 0) + 1)
    }
  })
  
  // Find mode (value with highest count)
  let maxCount = 0
  let mode: unknown = null
  
  countMap.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count
      mode = value
    }
  })
  
  return mode
}

/**
 * Calculates the population standard deviation of numeric values.
 * Measures how spread out the values are from their average (mean).
 * 
 * @example
 * ```ts
 * // For column values: [2, 4, 4, 4, 5, 5, 7, 9]
 * // Returns: 2 (approximately)
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The standard deviation, or null if fewer than 1 numeric value
 */
export const stdDevAggregation: AggregationFunction = (columnId, leafRows) => {
  if (!leafRows.length) return null
  
  const values: number[] = []
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      values.push(value)
    }
  })
  
  if (!values.length) return null
  
  // Calculate mean
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  
  // Calculate sum of squared differences
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
  const sumSquaredDiffs = squaredDiffs.reduce((sum, value) => sum + value, 0)
  
  // Calculate standard deviation
  return Math.sqrt(sumSquaredDiffs / values.length)
}

/**
 * Calculates the specified percentile of numeric values.
 * Uses linear interpolation between values when necessary.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 3, 4, 5]
 * // Config: { percentile: 75 }
 * // Returns: 4 (75th percentile)
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @param config - Must include percentile (0-100)
 * @returns The calculated percentile, or null if no numeric values
 */
export const percentileAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const percentile = (config as PercentileAggregationConfig)?.percentile || 50
  
  const values: number[] = []
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      values.push(value)
    }
  })
  
  if (!values.length) return null
  
  // Sort values
  values.sort((a, b) => a - b)
  
  // Calculate percentile index
  const index = (percentile / 100) * (values.length - 1)
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)
  
  // Interpolate if needed
  if (lowerIndex === upperIndex) {
    return values[lowerIndex]
  }
  
  const lowerValue = values[lowerIndex]
  const upperValue = values[upperIndex]
  const fraction = index - lowerIndex
  
  return lowerValue + (upperValue - lowerValue) * fraction
}

/**
 * Returns the first value in the group of rows.
 * Useful for getting the initial value in a sorted group.
 * 
 * @example
 * ```ts
 * // For column values: ['A', 'B', 'C']
 * // Returns: 'A'
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The first value, or null if no rows
 */
export const firstAggregation: AggregationFunction = (columnId, leafRows) => {
  if (!leafRows.length) {
    return null;
  }
  
  return leafRows[0].getValue(columnId);
}

/**
 * Returns the last value in the group of rows.
 * Useful for getting the final value in a sorted group.
 * 
 * @example
 * ```ts
 * // For column values: ['A', 'B', 'C']
 * // Returns: 'C'
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The last value, or null if no rows
 */
export const lastAggregation: AggregationFunction = (columnId, leafRows) => {
  return leafRows.length ? leafRows[leafRows.length - 1].getValue(columnId) : null
}

/**
 * Joins the values in the column into a single string with a separator.
 * Supports limiting the number of values included in the result.
 * 
 * @example
 * ```ts
 * // For column values: ['A', 'B', 'C', 'D']
 * // Config: { separator: ', ', limit: 3 }
 * // Returns: 'A, B, C'
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @param config - Optional separator (default: ', ') and limit
 * @returns The joined string, or null if no values
 */
export const joinAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const { separator = ', ', limit } = (config as JoinAggregationConfig) || {}
  
  const values: unknown[] = []
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (value !== undefined && value !== null) {
      values.push(value)
    }
  })
  
  if (!values.length) return null
  
  // Apply limit if specified
  const limitedValues = limit ? values.slice(0, limit) : values
  
  return limitedValues.join(separator)
} 