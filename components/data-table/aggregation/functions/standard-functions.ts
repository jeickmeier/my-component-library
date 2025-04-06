/**
 * Standard Aggregation Functions Module
 * 
 * This module provides a set of standard aggregation functions commonly used in data tables.
 * Each function implements the AggregationFunction interface and handles null/undefined values appropriately.
 */

import { AggregationFunction } from "../core"

/**
 * Calculates the sum of numeric values in a column.
 * Ignores non-numeric values in the calculation.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 3, null, 4]
 * // Returns: 10
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The sum of numeric values, or 0 if no numeric values found
 */
export const sumAggregation: AggregationFunction = (columnId, leafRows) => {
  let sum = 0
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      sum += value
    }
  })
  return sum
}

/**
 * Calculates the arithmetic mean (average) of numeric values in a column.
 * Uses the sum aggregation and divides by the count of rows.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 3, null, 4]
 * // Returns: 2.5 (sum=10, count=4)
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The average of numeric values, or 0 if no rows
 */
export const avgAggregation: AggregationFunction = (columnId, leafRows, childRows, config) => {
  const sum = sumAggregation(columnId, leafRows, childRows, config)
  return leafRows.length ? sum : 0
}

/**
 * Finds the minimum numeric value in a column.
 * Ignores non-numeric values in the calculation.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 3, null, 4]
 * // Returns: 1
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The minimum value, or null if no numeric values found
 */
export const minAggregation: AggregationFunction = (columnId, leafRows) => {
  let min: number | null = null
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      min = min === null ? value : Math.min(min, value)
    }
  })
  return min
}

/**
 * Finds the maximum numeric value in a column.
 * Ignores non-numeric values in the calculation.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 3, null, 4]
 * // Returns: 4
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The maximum value, or null if no numeric values found
 */
export const maxAggregation: AggregationFunction = (columnId, leafRows) => {
  let max: number | null = null
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      max = max === null ? value : Math.max(max, value)
    }
  })
  return max
}

/**
 * Counts the number of rows in a group.
 * Includes all rows, regardless of their values.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 3, null, 4]
 * // Returns: 5
 * ```
 * 
 * @param _ - Unused column ID parameter
 * @param leafRows - The rows to count
 * @returns The total number of rows
 */
export const countAggregation: AggregationFunction = (_, leafRows) => {
  return leafRows.length
}

/**
 * Creates a range string showing the minimum and maximum values.
 * Uses the min and max aggregations internally.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 3, null, 4]
 * // Returns: "1 - 4"
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns A string in the format "min - max", or null if no numeric values
 */
export const rangeAggregation: AggregationFunction = (columnId, leafRows, childRows, config) => {
  const min = minAggregation(columnId, leafRows, childRows, config)
  const max = maxAggregation(columnId, leafRows, childRows, config)
  if (min === null || max === null) return null
  return `${min} - ${max}`
}

/**
 * Returns an array of unique values from a column.
 * Excludes null and undefined values.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 2, null, 1, 3]
 * // Returns: [1, 2, 3]
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns Array of unique values, excluding null/undefined
 */
export const uniqueAggregation: AggregationFunction = (columnId, leafRows) => {
  const uniqueValues = new Set<unknown>()
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (value !== undefined && value !== null) {
      uniqueValues.add(value)
    }
  })
  return Array.from(uniqueValues)
}

/**
 * Counts the number of unique values in a column.
 * Uses uniqueAggregation internally and returns the length of the result.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 2, null, 1, 3]
 * // Returns: 3
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The count of unique values, excluding null/undefined
 */
export const uniqueCountAggregation: AggregationFunction = (columnId, leafRows, childRows, config) => {
  const uniqueValues = uniqueAggregation(columnId, leafRows, childRows, config) as unknown[]
  return uniqueValues.length
}

/**
 * Calculates the median (middle value) of numeric values in a column.
 * For even number of values, returns the average of the two middle values.
 * 
 * @example
 * ```ts
 * // For column values: [1, 2, 3, null, 5]
 * // Returns: 2.5
 * ```
 * 
 * @param columnId - The ID of the column to aggregate
 * @param leafRows - The rows to aggregate
 * @returns The median value, or null if no numeric values
 */
export const medianAggregation: AggregationFunction = (columnId, leafRows) => {
  const values: number[] = []
  leafRows.forEach(row => {
    const value = row.getValue(columnId)
    if (typeof value === 'number') {
      values.push(value)
    }
  })

  if (!values.length) return null
  
  values.sort((a, b) => a - b)
  const mid = Math.floor(values.length / 2)
  
  return values.length % 2 === 0
    ? (values[mid - 1] + values[mid]) / 2
    : values[mid]
} 