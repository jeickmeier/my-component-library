/**
 * Aggregation Types Module
 * 
 * This module defines the core types and interfaces for the aggregation system.
 * It provides a comprehensive type system for:
 * - Aggregation function definitions
 * - Standard and custom aggregation types
 * - Configuration interfaces for different aggregation methods
 * 
 * The type system is designed to be extensible while maintaining type safety
 * and providing clear documentation of available options.
 * 
 * @module aggregation/types
 */

import { Row } from "@tanstack/react-table"

/**
 * Interface for aggregation functions that process table data.
 * 
 * Aggregation functions take a set of rows and produce a single aggregated value.
 * They can operate on either leaf rows (rows with no children) or all rows in a group,
 * and can be configured with additional options through the config parameter.
 * 
 * @template TData The type of data in the table rows
 * @param columnId The ID of the column being aggregated
 * @param leafRows The lowest-level rows in the current group (no children)
 * @param childRows All rows in the current group (including children)
 * @param config Optional configuration for the aggregation function
 * @returns The aggregated value
 * 
 * @example
 * ```ts
 * const sumFunction: AggregationFunction<Order> = (
 *   columnId,
 *   leafRows,
 *   childRows,
 *   config
 * ) => {
 *   return leafRows.reduce((sum, row) => {
 *     const value = row.getValue(columnId);
 *     return sum + (typeof value === 'number' ? value : 0);
 *   }, 0);
 * };
 * ```
 */
export type AggregationFunction<TData = unknown> = (
  columnId: string,
  leafRows: Row<TData>[],
  childRows: Row<TData>[],
  config?: AggregationFunctionConfig
) => unknown

/**
 * Standard aggregation function types compatible with TanStack Table.
 * These represent the most common aggregation operations used in data tables.
 * 
 * Each type corresponds to a specific aggregation operation:
 * - 'sum': Adds up all values in the group
 * - 'min': Finds the smallest value
 * - 'max': Finds the largest value
 * - 'extent': Returns [min, max] array
 * - 'mean': Calculates arithmetic average
 * - 'median': Finds the middle value
 * - 'unique': Lists all unique values
 * - 'uniqueCount': Counts unique values
 * - 'count': Counts all values
 * 
 * @example
 * ```ts
 * const type: StandardAggregationFunctionType = 'sum';
 * registry.get(type)(columnId, rows);
 * ```
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
 * These functions offer more advanced statistical operations and data manipulation.
 * 
 * Each type provides specialized aggregation:
 * - 'weightedAvg': Average weighted by another column
 * - 'mode': Most frequent value
 * - 'stdDev': Standard deviation
 * - 'percentile': Nth percentile of values
 * - 'first': First value in group
 * - 'last': Last value in group
 * - 'join': Concatenate values with separator
 * 
 * @example
 * ```ts
 * const type: CustomAggregationFunctionType = 'weightedAvg';
 * registry.get(type)(columnId, rows, { weightColumnId: 'weight' });
 * ```
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
 * Includes both standard and custom functions, plus allows for string-based custom types.
 * 
 * This type is extensible, allowing for registration of additional custom
 * aggregation functions beyond the built-in types.
 * 
 * @example
 * ```ts
 * const type: AggregationFunctionType = 'customFunction';
 * registry.register(type, myCustomFunction);
 * ```
 */
export type AggregationFunctionType = 
  | StandardAggregationFunctionType 
  | CustomAggregationFunctionType
  | string

/**
 * Base configuration interface for aggregation functions.
 * Provides common configuration options that apply to all aggregation functions.
 * 
 * @property label - Display name for the aggregation function
 * @property description - Detailed description of what the function does
 * @property [key: string] - Additional custom configuration options
 * 
 * @example
 * ```ts
 * const config: AggregationFunctionConfig = {
 *   label: 'Custom Sum',
 *   description: 'Sums values with special handling for nulls'
 * };
 * ```
 */
export interface AggregationFunctionConfig {
  label?: string
  description?: string
  [key: string]: unknown
}

/**
 * Configuration for weighted average aggregation.
 * Extends the base config with weight column specification.
 * 
 * @property weightColumnId - ID of the column containing weights
 * 
 * @example
 * ```ts
 * const config: WeightedAvgAggregationConfig = {
 *   weightColumnId: 'quantity',
 *   label: 'Weighted Average Price'
 * };
 * ```
 */
export interface WeightedAvgAggregationConfig extends AggregationFunctionConfig {
  weightColumnId: string
}

/**
 * Configuration for percentile calculations.
 * Extends the base config with percentile specification.
 * 
 * @property percentile - The percentile to calculate (0-100)
 * 
 * @example
 * ```ts
 * const config: PercentileAggregationConfig = {
 *   percentile: 95,
 *   label: '95th Percentile'
 * };
 * ```
 */
export interface PercentileAggregationConfig extends AggregationFunctionConfig {
  percentile: number
}

/**
 * Configuration for joining values into a string.
 * Extends the base config with joining options.
 * 
 * @property separator - String used to join values
 * @property limit - Optional maximum number of values to join
 * 
 * @example
 * ```ts
 * const config: JoinAggregationConfig = {
 *   separator: ', ',
 *   limit: 3,
 *   label: 'Comma-separated List'
 * };
 * ```
 */
export interface JoinAggregationConfig extends AggregationFunctionConfig {
  separator: string
  limit?: number
} 