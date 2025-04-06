import { Row } from "@tanstack/react-table"

/**
 * Interface for aggregation function
 */
export type AggregationFunction<TData = unknown> = (
  columnId: string,
  leafRows: Row<TData>[],
  childRows: Row<TData>[],
  config?: AggregationFunctionConfig
) => unknown

/**
 * Standard aggregation function types from TanStack Table
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
 * Custom aggregation function types
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
 * Union of all aggregation function types
 */
export type AggregationFunctionType = 
  | StandardAggregationFunctionType 
  | CustomAggregationFunctionType
  | string

/**
 * Configuration for aggregation functions
 */
export interface AggregationFunctionConfig {
  label?: string
  description?: string
  [key: string]: unknown
}

/**
 * Weighted average aggregation config
 */
export interface WeightedAvgAggregationConfig extends AggregationFunctionConfig {
  weightColumnId: string
}

/**
 * Percentile aggregation config
 */
export interface PercentileAggregationConfig extends AggregationFunctionConfig {
  percentile: number
}

/**
 * Join aggregation config
 */
export interface JoinAggregationConfig extends AggregationFunctionConfig {
  separator: string
  limit?: number
} 