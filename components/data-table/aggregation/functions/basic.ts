/**
 * Basic Aggregation Functions
 * 
 * This module provides fundamental aggregation functions for data tables:
 * - sum: Adds numeric values
 * - avg: Calculates average of numeric values
 * - min: Finds minimum numeric value
 * - max: Finds maximum numeric value
 * - count: Counts rows
 */

import { AggregationFunction } from "../types"
import { getNumericValues, calculateMean } from "../utils"

/**
 * Calculates the sum of numeric values in a column.
 */
export const sumAggregation: AggregationFunction = (columnId, leafRows) => {
  const values = getNumericValues(columnId, leafRows);
  return values.reduce((sum, value) => sum + value, 0);
}

/**
 * Calculates the arithmetic mean (average) of numeric values in a column.
 */
export const avgAggregation: AggregationFunction = (columnId, leafRows) => {
  const values = getNumericValues(columnId, leafRows);
  return calculateMean(values);
}

/**
 * Finds the minimum numeric value in a column.
 */
export const minAggregation: AggregationFunction = (columnId, leafRows) => {
  const values = getNumericValues(columnId, leafRows);
  return values.length ? Math.min(...values) : null;
}

/**
 * Finds the maximum numeric value in a column.
 */
export const maxAggregation: AggregationFunction = (columnId, leafRows) => {
  const values = getNumericValues(columnId, leafRows);
  return values.length ? Math.max(...values) : null;
}

/**
 * Counts the number of rows in a group.
 */
export const countAggregation: AggregationFunction = (_, leafRows) => {
  return leafRows.length;
} 