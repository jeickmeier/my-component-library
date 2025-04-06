/**
 * Aggregation Types Module
 * 
 * This module defines the core types and interfaces for the aggregation system.
 * It provides a comprehensive type system for:
 * - Aggregation function definitions
 * - Standard and custom aggregation types
 * - Configuration interfaces for different aggregation methods
 */

import { Row } from "@tanstack/react-table"

/**
 * Interface for aggregation functions that process table data.
 * 
 * Aggregation functions take a set of rows and produce a single aggregated value.
 * They can operate on either leaf rows (rows with no children) or all rows in a group,
 * and can be configured with additional options through the config parameter.
 */
export type AggregationFunction<TData = unknown> = (
  columnId: string,
  leafRows: Row<TData>[],
  childRows: Row<TData>[],
  config?: AggregationFunctionConfig
) => unknown

/**
 * Standard aggregation function types compatible with TanStack Table.
 */
export type StandardAggregationFunctionType = 
  | 'sum'        // Sum values
  | 'min'        // Minimum value
  | 'max'        // Maximum value
  | 'extent'     // Array of min and max
  | 'mean'       // Average (like our 'avg')
  | 'median'     // Median value
  | 'unique'     // Array of unique values
  | 'uniqueCount' // Count of unique values
  | 'count'      // Count of values

/**
 * Extended aggregation function types providing additional analytical capabilities.
 */
export type CustomAggregationFunctionType =
  | 'weightedAvg'
  | 'mode'
  | 'stdDev'
  | 'percentile'
  | 'first'
  | 'last'
  | 'join'

/**
 * Union type of all supported aggregation function types.
 */
export type AggregationFunctionType = 
  | StandardAggregationFunctionType 
  | CustomAggregationFunctionType
  | string

/**
 * Base configuration interface for aggregation functions.
 */
export interface AggregationFunctionConfig {
  label?: string
  description?: string
  [key: string]: unknown
}

/**
 * Configuration for weighted average aggregation.
 */
export interface WeightedAvgAggregationConfig extends AggregationFunctionConfig {
  weightColumnId: string
}

/**
 * Configuration for percentile calculations.
 */
export interface PercentileAggregationConfig extends AggregationFunctionConfig {
  percentile: number
}

/**
 * Configuration for joining values into a string.
 */
export interface JoinAggregationConfig extends AggregationFunctionConfig {
  separator: string
  limit?: number
} 