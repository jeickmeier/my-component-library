/**
 * Data Table Types
 * 
 * This file contains all type definitions used across the data table components.
 * It centralizes types to avoid duplication and ensure consistency.
 */

import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, GroupingState, ExpandedState, HeaderContext } from "@tanstack/react-table"
import * as React from "react"
import { AggregationFunctionType, AggregationFunctionConfig } from "./aggregation"

/**
 * Filter Option Types
 */
export interface FilterOption {
  label: string
  value: string
}

/**
 * Column Filter Base Type
 */
export interface BaseFilter {
  type: string;
  column?: string;
}

/**
 * Select Filter Type
 */
export interface SelectFilter extends BaseFilter {
  type: 'select';
  options?: FilterOption[];
  getOptionsFromData?: boolean;
}

/**
 * Multi-Select Filter Type
 */
export interface MultiSelectFilter extends BaseFilter {
  type: 'multi-select';
  options?: FilterOption[];
  getOptionsFromData?: boolean;
}

/**
 * Numeric Range Filter Type
 */
export interface RangeFilter extends BaseFilter {
  type: 'range';
  min?: number;
  max?: number;
}

/**
 * Date Range Filter Type
 */
export interface DateRangeFilter extends BaseFilter {
  type: 'date-range';
  min?: string; // ISO date string
  max?: string; // ISO date string
}

/**
 * Boolean Filter Type
 */
export interface BooleanFilter extends BaseFilter {
  type: 'boolean';
  value?: boolean;
}

/**
 * Union type for all column filters
 */
export type ColumnFilter = 
  | SelectFilter 
  | MultiSelectFilter 
  | RangeFilter 
  | DateRangeFilter
  | BooleanFilter

/**
 * Type guards for column filters
 */
export function isSelectFilter(filter: ColumnFilter): filter is SelectFilter {
  return filter.type === 'select';
}

export function isMultiSelectFilter(filter: ColumnFilter): filter is MultiSelectFilter {
  return filter.type === 'multi-select';
}

export function isRangeFilter(filter: ColumnFilter): filter is RangeFilter {
  return filter.type === 'range';
}

export function isDateRangeFilter(filter: ColumnFilter): filter is DateRangeFilter {
  return filter.type === 'date-range';
}

export function isBooleanFilter(filter: ColumnFilter): filter is BooleanFilter {
  return filter.type === 'boolean';
}

/**
 * Enhanced column definition that includes filtering and grouping metadata
 */
export interface DataTableColumnDef<TData, TValue = unknown> extends Omit<ColumnDef<TData, TValue>, "id"> {
  id?: string
  accessorKey?: string
  header?: string | ((context: HeaderContext<TData, unknown>) => React.ReactNode)
  enableGrouping?: boolean
  filter?: ColumnFilter
  /**
   * Optional alignment override that applies to both header and cells.
   * When specified, this overrides the automatic alignment based on data types.
   * Possible values: 'left' (default), 'center', 'right'
   */
  alignment?: 'left' | 'center' | 'right'
  /**
   * Cell renderer configuration
   */
  cellRenderer?: SerializableCellRenderer
  /**
   * Aggregation type to use when this column is aggregated
   * Can be a standard TanStack aggregation function, a custom function from the registry,
   * or a custom aggregation function
   */
  aggregationType?: AggregationFunctionType
  /**
   * Optional configuration for the aggregation function
   */
  aggregationConfig?: AggregationFunctionConfig
}

/**
 * Complete schema for a data table
 */
export interface DataTableSchema<TData> {
  columns: DataTableColumnDef<TData>[]
  defaultSorting?: SortingState
  defaultGrouping?: GroupingState
  defaultColumnVisibility?: VisibilityState
  enableGrouping?: boolean
  enableGlobalFilter?: boolean
  enablePagination?: boolean
  enableExport?: boolean
  defaultPageSize?: number
}

/**
 * Interface for the data table props
 */
export interface DataTableProps<TData> {
  schema: DataTableSchema<TData>
  data: TData[]
}

/**
 * Serializable cell renderer configuration
 */
export interface SerializableCellRenderer {
  type: string
  config?: Record<string, unknown>
}

/**
 * Serializable version of a column definition
 */
export interface SerializableColumnDef {
  id?: string
  accessorKey?: string
  header?: string
  enableGrouping?: boolean
  enableSorting?: boolean
  alignment?: 'left' | 'center' | 'right'
  filter?: ColumnFilter
  cellRenderer?: SerializableCellRenderer
  /**
   * Aggregation type to use when this column is aggregated
   */
  aggregationType?: AggregationFunctionType
  /**
   * Optional configuration for the aggregation function
   */
  aggregationConfig?: Record<string, unknown>
}

/**
 * Serializable version of a data table schema
 */
export interface SerializableDataTableSchema {
  columns: SerializableColumnDef[]
  defaultSorting?: { id: string, desc: boolean }[]
  defaultGrouping?: string[]
  defaultColumnVisibility?: Record<string, boolean>
  enableGrouping?: boolean
  enableGlobalFilter?: boolean
  enablePagination?: boolean
  enableExport?: boolean
  defaultPageSize?: number
}

/**
 * Interface for groupable column objects used in the GroupingPanel component
 */
export interface GroupableColumn {
  id: string
  label: string
}

/**
 * DataTable Context Value interface
 */
export interface DataTableContextValue<TData> {
  schema: DataTableSchema<TData>
  data: TData[]
  sorting: SortingState
  setSorting: (sorting: SortingState) => void
  columnFilters: ColumnFiltersState
  setColumnFilters: (filters: ColumnFiltersState) => void
  globalFilter: string
  setGlobalFilter: (filter: string) => void
  columnVisibility: VisibilityState
  setColumnVisibility: (visibility: VisibilityState) => void
  grouping: GroupingState
  setGrouping: (grouping: GroupingState) => void
  expanded: ExpandedState
  setExpanded: (expanded: ExpandedState) => void
  table: unknown // Will be strongly typed in the implementation
  isInitialized: boolean
} 