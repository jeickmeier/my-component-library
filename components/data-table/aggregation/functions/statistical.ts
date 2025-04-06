/**
 * Statistical Aggregation Functions
 * 
 * This module provides advanced statistical aggregation functions:
 * - median: Calculates the middle value
 * - stdDev: Calculates standard deviation
 * - percentile: Calculates percentiles
 * - weightedAvg: Calculates weighted average
 */

import { AggregationFunction, WeightedAvgAggregationConfig, PercentileAggregationConfig } from "../types"
import { getNumericValues, calculateMedian } from "../utils"

/**
 * Calculates the median (middle value) of numeric values in a column.
 */
export const medianAggregation: AggregationFunction = (columnId, leafRows) => {
  const values = getNumericValues(columnId, leafRows);
  return calculateMedian(values);
}

/**
 * Calculates the population standard deviation of numeric values.
 */
export const stdDevAggregation: AggregationFunction = (columnId, leafRows) => {
  const values = getNumericValues(columnId, leafRows);
  if (!values.length) return null;
  
  // Calculate mean
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  
  // Calculate sum of squared differences
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const sumSquaredDiffs = squaredDiffs.reduce((sum, value) => sum + value, 0);
  
  // Calculate standard deviation
  return Math.sqrt(sumSquaredDiffs / values.length);
}

/**
 * Calculates the specified percentile of numeric values.
 */
export const percentileAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const percentile = (config as PercentileAggregationConfig)?.percentile || 50;
  const values = getNumericValues(columnId, leafRows);
  
  if (!values.length) return null;
  
  // Sort values
  values.sort((a, b) => a - b);
  
  // Calculate percentile index
  const index = (percentile / 100) * (values.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  
  // Interpolate if needed
  if (lowerIndex === upperIndex) {
    return values[lowerIndex];
  }
  
  const lowerValue = values[lowerIndex];
  const upperValue = values[upperIndex];
  const fraction = index - lowerIndex;
  
  return lowerValue + (upperValue - lowerValue) * fraction;
}

/**
 * Calculates a weighted average where each value is multiplied by a weight from another column.
 */
export const weightedAvgAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const weightColumnId = (config as WeightedAvgAggregationConfig)?.weightColumnId;
  if (!weightColumnId) {
    return null;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  leafRows.forEach(row => {
    const value = row.getValue(columnId);
    const weight = row.getValue(weightColumnId);
    
    if (typeof value === 'number' && typeof weight === 'number') {
      weightedSum += value * weight;
      totalWeight += weight;
    }
  });

  return totalWeight ? weightedSum / totalWeight : null;
} 