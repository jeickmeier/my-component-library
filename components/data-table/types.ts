/**
 * Data Table Types Module
 * 
 * This module contains all type definitions used across the data table components.
 * It centralizes types to avoid duplication and ensure consistency throughout the codebase.
 * 
 * Key Type Categories:
 * - Filter Types: Define various filter configurations (select, multi-select, range, etc.)
 * - Column Types: Define column structure and behavior
 * - Schema Types: Define table structure and configuration
 * - Context Types: Define state management and context values
 * - Serialization Types: Define serializable versions of complex types
 * 
 * Features:
 * - Type-safe filter configurations
 * - Flexible column definitions
 * - Comprehensive schema structure
 * - Serializable data structures
 * - Type guards for runtime type checking
 * 
 * @module data-table-types
 */

import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, GroupingState, ExpandedState, HeaderContext } from "@tanstack/react-table"
import * as React from "react"
import { AggregationFunctionType, AggregationFunctionConfig } from "./aggregation"

/**
 * Filter Option Type
 * 
 * Represents a single option in a filter dropdown or selection.
 * 
 * @example
 * ```typescript
 * const options: FilterOption[] = [
 *   { label: 'Active', value: 'active' },
 *   { label: 'Inactive', value: 'inactive' }
 * ];
 * ```
 */
export interface FilterOption {
  label: string
  value: string
}

/**
 * Base Filter Type
 * 
 * Common properties shared by all filter types.
 * 
 * @example
 * ```typescript
 * const baseFilter: BaseFilter = {
 *   type: 'select',
 *   column: 'status'
 * };
 * ```
 */
export interface BaseFilter {
  type: string;
  column?: string;
}

/**
 * Select Filter Type
 * 
 * Represents a single-select filter configuration.
 * 
 * @example
 * ```typescript
 * const selectFilter: SelectFilter = {
 *   type: 'select',
 *   options: [
 *     { label: 'Active', value: 'active' },
 *     { label: 'Inactive', value: 'inactive' }
 *   ]
 * };
 * ```
 */
export interface SelectFilter extends BaseFilter {
  type: 'select';
  options?: FilterOption[];
  getOptionsFromData?: boolean;
}

/**
 * Multi-Select Filter Type
 * 
 * Represents a multi-select filter configuration.
 * 
 * @example
 * ```typescript
 * const multiSelectFilter: MultiSelectFilter = {
 *   type: 'multi-select',
 *   options: [
 *     { label: 'Red', value: 'red' },
 *     { label: 'Blue', value: 'blue' },
 *     { label: 'Green', value: 'green' }
 *   ]
 * };
 * ```
 */
export interface MultiSelectFilter extends BaseFilter {
  type: 'multi-select';
  options?: FilterOption[];
  getOptionsFromData?: boolean;
}

/**
 * Numeric Range Filter Type
 * 
 * Represents a numeric range filter configuration.
 * 
 * @example
 * ```typescript
 * const rangeFilter: RangeFilter = {
 *   type: 'range',
 *   min: 0,
 *   max: 100
 * };
 * ```
 */
export interface RangeFilter extends BaseFilter {
  type: 'range';
  min?: number;
  max?: number;
}

/**
 * Date Range Filter Type
 * 
 * Represents a date range filter configuration.
 * 
 * @example
 * ```typescript
 * const dateRangeFilter: DateRangeFilter = {
 *   type: 'date-range',
 *   min: '2023-01-01',
 *   max: '2023-12-31'
 * };
 * ```
 */
export interface DateRangeFilter extends BaseFilter {
  type: 'date-range';
  min?: string; // ISO date string
  max?: string; // ISO date string
}

/**
 * Boolean Filter Type
 * 
 * Represents a boolean filter configuration.
 * 
 * @example
 * ```typescript
 * const booleanFilter: BooleanFilter = {
 *   type: 'boolean',
 *   value: true
 * };
 * ```
 */
export interface BooleanFilter extends BaseFilter {
  type: 'boolean';
  value?: boolean;
}

/**
 * Union type for all column filters
 * 
 * Represents any valid filter type that can be applied to a column.
 * 
 * @example
 * ```typescript
 * const filter: ColumnFilter = {
 *   type: 'select',
 *   options: [
 *     { label: 'Active', value: 'active' }
 *   ]
 * };
 * ```
 */
export type ColumnFilter = 
  | SelectFilter 
  | MultiSelectFilter 
  | RangeFilter 
  | DateRangeFilter
  | BooleanFilter

/**
 * Type guard for SelectFilter
 * 
 * @param filter - The filter to check
 * @returns true if the filter is a SelectFilter
 */
export function isSelectFilter(filter: ColumnFilter): filter is SelectFilter {
  return filter.type === 'select';
}

/**
 * Type guard for MultiSelectFilter
 * 
 * @param filter - The filter to check
 * @returns true if the filter is a MultiSelectFilter
 */
export function isMultiSelectFilter(filter: ColumnFilter): filter is MultiSelectFilter {
  return filter.type === 'multi-select';
}

/**
 * Type guard for RangeFilter
 * 
 * @param filter - The filter to check
 * @returns true if the filter is a RangeFilter
 */
export function isRangeFilter(filter: ColumnFilter): filter is RangeFilter {
  return filter.type === 'range';
}

/**
 * Type guard for DateRangeFilter
 * 
 * @param filter - The filter to check
 * @returns true if the filter is a DateRangeFilter
 */
export function isDateRangeFilter(filter: ColumnFilter): filter is DateRangeFilter {
  return filter.type === 'date-range';
}

/**
 * Type guard for BooleanFilter
 * 
 * @param filter - The filter to check
 * @returns true if the filter is a BooleanFilter
 */
export function isBooleanFilter(filter: ColumnFilter): filter is BooleanFilter {
  return filter.type === 'boolean';
}

/**
 * Enhanced column definition that includes filtering and grouping metadata
 * 
 * Extends TanStack Table's ColumnDef with additional features:
 * - Filter configuration
 * - Grouping support
 * - Cell alignment
 * - Custom cell rendering
 * - Aggregation support
 * 
 * @example
 * ```typescript
 * const column: DataTableColumnDef<User> = {
 *   id: 'name',
 *   header: 'Name',
 *   accessorKey: 'name',
 *   enableGrouping: true,
 *   filter: {
 *     type: 'select',
 *     options: [
 *       { label: 'John', value: 'John' },
 *       { label: 'Jane', value: 'Jane' }
 *     ]
 *   }
 * };
 * ```
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
 * 
 * Defines the structure and behavior of a data table, including:
 * - Column definitions
 * - Default sorting
 * - Default grouping
 * - Column visibility
 * - Feature flags
 * - Pagination settings
 * 
 * @example
 * ```typescript
 * const schema: DataTableSchema<User> = {
 *   columns: [
 *     { id: 'name', header: 'Name', accessorKey: 'name' },
 *     { id: 'age', header: 'Age', accessorKey: 'age' }
 *   ],
 *   defaultSorting: [{ id: 'name', desc: false }],
 *   enableGrouping: true,
 *   enablePagination: true,
 *   defaultPageSize: 10
 * };
 * ```
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
 * 
 * @example
 * ```typescript
 * const props: DataTableProps<User> = {
 *   schema: userSchema,
 *   data: users
 * };
 * ```
 */
export interface DataTableProps<TData> {
  schema: DataTableSchema<TData>
  data: TData[]
}

/**
 * Serializable cell renderer configuration
 * 
 * Defines a cell renderer that can be serialized and stored.
 * 
 * @example
 * ```typescript
 * const renderer: SerializableCellRenderer = {
 *   type: 'progress',
 *   config: { min: 0, max: 100 }
 * };
 * ```
 */
export interface SerializableCellRenderer {
  type: string
  config?: Record<string, unknown>
}

/**
 * Serializable version of a column definition
 * 
 * A simplified version of DataTableColumnDef that can be serialized.
 * 
 * @example
 * ```typescript
 * const column: SerializableColumnDef = {
 *   id: 'name',
 *   header: 'Name',
 *   accessorKey: 'name',
 *   enableGrouping: true
 * };
 * ```
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
 * 
 * A simplified version of DataTableSchema that can be serialized.
 * 
 * @example
 * ```typescript
 * const schema: SerializableDataTableSchema = {
 *   columns: [
 *     { id: 'name', header: 'Name', accessorKey: 'name' }
 *   ],
 *   defaultSorting: [{ id: 'name', desc: false }],
 *   enableGrouping: true
 * };
 * ```
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
 * 
 * @example
 * ```typescript
 * const column: GroupableColumn = {
 *   id: 'department',
 *   label: 'Department'
 * };
 * ```
 */
export interface GroupableColumn {
  id: string
  label: string
}

/**
 * DataTable Context Value interface
 * 
 * Defines the shape of the context value provided by the DataTable context.
 * Includes all state management functions and current state values.
 * 
 * @example
 * ```typescript
 * const context: DataTableContextValue<User> = {
 *   schema: userSchema,
 *   data: users,
 *   sorting: [{ id: 'name', desc: false }],
 *   setSorting: (sorting) => {},
 *   columnFilters: [],
 *   setColumnFilters: (filters) => {},
 *   globalFilter: '',
 *   setGlobalFilter: (filter) => {},
 *   columnVisibility: {},
 *   setColumnVisibility: (visibility) => {},
 *   grouping: [],
 *   setGrouping: (grouping) => {},
 *   expanded: {},
 *   setExpanded: (expanded) => {},
 *   table: null,
 *   isInitialized: true
 * };
 * ```
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