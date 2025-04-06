/**
 * Column Helper
 * 
 * This file contains helper functions for creating column definitions.
 */

import * as React from "react";
import { CellContext, ColumnDef, AccessorFn, AggregationFn } from "@tanstack/react-table";
import { ColumnFilter } from "../types";
import { AggregationFunctionType, AggregationFunctionConfig } from "../aggregation";

/**
 * Helper function to create column definitions with improved header functionality
 * 
 * @param options Column configuration options
 * @returns A column definition with sorting and visibility enabled by default
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
  filter?: ColumnFilter; // Column filter configuration
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
 * Creates a set of columns from an array of column configurations
 */
export function createColumns<T>(columnsConfig: Array<Parameters<typeof createColumn<T>>[0]>): ColumnDef<T, unknown>[] {
  return columnsConfig.map(config => createColumn<T>(config));
} 