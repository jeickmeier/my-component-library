/**
 * Grouping Aggregation Functions
 * 
 * This module provides aggregation functions related to grouping and unique values:
 * - unique: Lists unique values
 * - uniqueCount: Counts unique values
 * - mode: Finds most frequent value
 * - range: Creates min-max range representation
 */

import { AggregationFunction } from "../types"
import { getNumericValues, getUniqueValues } from "../utils"

/**
 * Returns an array of unique values from a column.
 */
export const uniqueAggregation: AggregationFunction = (columnId, leafRows) => {
  return getUniqueValues(columnId, leafRows);
}

/**
 * Counts the number of unique values in a column.
 */
export const uniqueCountAggregation: AggregationFunction = (columnId, leafRows) => {
  const uniqueValues = getUniqueValues(columnId, leafRows);
  return uniqueValues.length;
}

/**
 * Finds the most frequently occurring value in a column (the statistical mode).
 */
export const modeAggregation: AggregationFunction = (columnId, leafRows) => {
  const countMap = new Map<unknown, number>();
  
  // Count occurrences
  leafRows.forEach(row => {
    const value = row.getValue(columnId);
    if (value !== undefined && value !== null) {
      countMap.set(value, (countMap.get(value) || 0) + 1);
    }
  });
  
  if (countMap.size === 0) return null;
  
  // Find mode (value with highest count)
  return Array.from(countMap.entries())
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

/**
 * Creates a range string showing the minimum and maximum values.
 */
export const rangeAggregation: AggregationFunction = (columnId, leafRows) => {
  const values = getNumericValues(columnId, leafRows);
  
  if (!values.length) return null;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return `${min} - ${max}`;
} 