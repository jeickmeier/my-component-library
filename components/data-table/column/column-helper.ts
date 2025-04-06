/**
 * Column Helper Module
 * 
 * This module provides utility functions for creating and configuring table columns.
 * It offers a type-safe and convenient way to define columns with various features
 * like sorting, filtering, grouping, and aggregation.
 * 
 * @module column-helper
 */

import * as React from "react";
import { CellContext, ColumnDef, AccessorFn, AggregationFn } from "@tanstack/react-table";
import { ColumnFilter } from "../types";
import { AggregationFunctionType, AggregationFunctionConfig } from "../aggregation";

/**
 * Creates a single column definition with enhanced functionality.
 * 
 * This helper function provides a strongly-typed way to create column definitions
 * with built-in support for common features and customizations.
 * 
 * Features:
 * - Sorting (enabled by default)
 * - Column visibility (enabled by default)
 * - Grouping (opt-in)
 * - Custom cell rendering
 * - Column alignment
 * - Filtering
 * - Aggregation
 * - Custom metadata
 * 
 * @template T The type of data in the table rows
 * 
 * @param options Configuration options for the column
 * @param options.id Unique identifier for the column
 * @param options.header Display text for the column header
 * @param options.accessorKey Key path to access data in the row (e.g., 'user.name')
 * @param options.accessorFn Custom function to access row data
 * @param options.cell Custom cell renderer function
 * @param options.enableSorting Whether sorting is enabled (default: true)
 * @param options.enableHiding Whether column can be hidden (default: true)
 * @param options.enableGrouping Whether grouping is enabled (default: false)
 * @param options.alignment Text alignment within cells
 * @param options.filter Column filter configuration
 * @param options.aggregationType Type of aggregation to apply
 * @param options.aggregationConfig Configuration for aggregation
 * @param options.meta Additional metadata for the column
 * 
 * @returns A configured column definition compatible with TanStack Table
 * 
 * @example
 * ```tsx
 * // Basic column
 * createColumn<User>({
 *   id: 'name',
 *   header: 'Name',
 *   accessorKey: 'name'
 * })
 * 
 * // Advanced column with custom rendering and aggregation
 * createColumn<Order>({
 *   id: 'total',
 *   header: 'Order Total',
 *   accessorKey: 'total',
 *   alignment: 'right',
 *   aggregationType: 'sum',
 *   cell: props => <CurrencyCell value={props.getValue()} />
 * })
 * ```
 */
export function createColumn<T>(options: {
  id: string;
  header: string;
  accessorKey?: keyof T | string;
  accessorFn?: (row: T) => unknown;
  cell?: ((props: CellContext<T, unknown>) => React.ReactNode) | undefined;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enableGrouping?: boolean;
  alignment?: 'left' | 'center' | 'right';
  filter?: ColumnFilter;
  aggregationType?: AggregationFunctionType;
  aggregationConfig?: AggregationFunctionConfig;
  meta?: Record<string, unknown>;
}): ColumnDef<T, unknown> {
  return {
    id: options.id,
    accessorKey: options.accessorKey as string,
    accessorFn: options.accessorFn as AccessorFn<T, unknown> | undefined,
    header: options.header,
    cell: options.cell,
    enableSorting: options.enableSorting !== false, // Enabled by default
    enableHiding: options.enableHiding !== false,   // Enabled by default
    enableGrouping: options.enableGrouping || false, // Disabled by default
    // Type assertion to fix type compatibility with TanStack Table
    aggregationFn: options.aggregationType as unknown as AggregationFn<T> | undefined,
    meta: {
      ...options.meta,
      alignment: options.alignment,
      filter: options.filter,
      aggregationConfig: options.aggregationConfig,
    },
  };
}

/**
 * Creates multiple column definitions from an array of configurations.
 * This is a convenience function for creating multiple columns at once.
 * 
 * @template T The type of data in the table rows
 * @param columnsConfig Array of column configurations
 * @returns Array of column definitions
 * 
 * @example
 * ```tsx
 * const columns = createColumns<User>([
 *   {
 *     id: 'name',
 *     header: 'Name',
 *     accessorKey: 'name'
 *   },
 *   {
 *     id: 'email',
 *     header: 'Email',
 *     accessorKey: 'email'
 *   }
 * ])
 * ```
 */
export function createColumns<T>(columnsConfig: Array<Parameters<typeof createColumn<T>>[0]>): ColumnDef<T, unknown>[] {
  return columnsConfig.map(config => createColumn<T>(config));
} 