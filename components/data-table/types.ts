import { ColumnDef, FilterFn, AggregationFn } from "@tanstack/react-table";

// Extend @tanstack/react-table module with our custom functions
declare module "@tanstack/react-table" {
  interface FilterFns {
    numberRange: FilterFn<unknown>;
  }

  interface AggregationFns {
    range: AggregationFn<unknown>;
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

export type ColumnFilter = SelectColumnFilter | RangeColumnFilter;

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnFilters?: ColumnFilter[];
  enableGrouping?: boolean;
  groupableColumns?: string[];
}
