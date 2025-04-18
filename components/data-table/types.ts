/**
 * Type definitions for the data table component library. Includes interfaces for various
 * filter types (select, range, star rating), table props, and extends @tanstack/react-table
 * with custom filter and aggregation functions. These types provide type safety and
 * documentation for the component's configuration options.
 */

import { ColumnDef, FilterFn } from "@tanstack/react-table";

// Extend @tanstack/react-table module with our custom functions
declare module "@tanstack/react-table" {
  interface FilterFns {
    numberRange: FilterFn<unknown>;
    starRating: FilterFn<unknown>;
  }

  interface AggregationFns {
    first: true;
    sparkline: true;
  }
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface SelectColumnFilter {
  type: "select";
  column: string;
  label: string;
  options: FilterOption[];
}

export interface RangeColumnFilter {
  type: "range";
  column: string;
  label: string;
  min?: number;
  max?: number;
}

export interface RangeSliderColumnFilter {
  type: "rangeSlider";
  column: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface StarRatingColumnFilter {
  type: "starRating";
  column: string;
  label: string;
  maxStars?: number;
}

export type ColumnFilter =
  | SelectColumnFilter
  | RangeColumnFilter
  | RangeSliderColumnFilter
  | StarRatingColumnFilter;

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /**
   * Optional array of filter configurations.
   * If not provided, columns with filterFn defined will be automatically discovered as filterable.
   */
  columnFilters?: ColumnFilter[];
  enableGrouping?: boolean;
  /**
   * Optional array of column IDs that can be grouped.
   * If not provided and enableGrouping is true, columns with enableGrouping: true will be automatically discovered.
   */
  groupableColumns?: string[];
  defaultPageSize?: number; // Number of rows to display per page
  containerHeight?: string; // CSS height value (e.g., '500px', '70vh', 'calc(100vh - 200px)')
  enableSorting?: boolean;
  enableColumnVisibility?: boolean;
  enableColumnFilters?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  defaultExpanded?: boolean | number | Record<string, boolean>;
  defaultGrouping?: string[];
}
