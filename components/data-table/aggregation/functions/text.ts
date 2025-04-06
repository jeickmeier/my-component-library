/**
 * Text Aggregation Functions
 * 
 * This module provides aggregation functions for working with text and sequences:
 * - first: Gets the first value in the group
 * - last: Gets the last value in the group
 * - join: Concatenates values with a separator
 */

import { AggregationFunction, JoinAggregationConfig } from "../types"
import { safeToString } from "../utils"

/**
 * Returns the first value in the group of rows.
 */
export const firstAggregation: AggregationFunction = (columnId, leafRows) => {
  return leafRows.length ? leafRows[0].getValue(columnId) : null;
}

/**
 * Returns the last value in the group of rows.
 */
export const lastAggregation: AggregationFunction = (columnId, leafRows) => {
  return leafRows.length ? leafRows[leafRows.length - 1].getValue(columnId) : null;
}

/**
 * Joins the values in the column into a single string with a separator.
 */
export const joinAggregation: AggregationFunction = (columnId, leafRows, _childRows, config) => {
  const { separator = ', ', limit } = (config as JoinAggregationConfig) || {};
  
  if (!leafRows.length) return null;
  
  // Get string values from rows
  const values = leafRows.map(row => {
    const value = row.getValue(columnId);
    return value !== null && value !== undefined ? safeToString(value) : '';
  }).filter(Boolean); // Remove empty strings
  
  if (!values.length) return null;
  
  // Apply limit if specified
  const limitedValues = limit ? values.slice(0, limit) : values;
  
  return limitedValues.join(separator);
} 