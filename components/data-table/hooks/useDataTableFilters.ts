/**
 * React hook that manages filter state and auto-discovery for the data table component.
 * Handles both column-specific filters and global search, with support for automatic
 * filter type detection based on column definitions. Provides state management for
 * filter values and exposes filter configuration options.
 */

import * as React from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import { ColumnFilter, FilterOption } from "@/components/data-table/types";
import type { ColumnDef } from "@tanstack/react-table";

interface UseDataTableFiltersProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  columnFilters?: ColumnFilter[];
}

interface UseDataTableFiltersReturn {
  columnFiltersState: ColumnFiltersState;
  setColumnFiltersState: React.Dispatch<
    React.SetStateAction<ColumnFiltersState>
  >;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  discoveredColumnFilters: ColumnFilter[];
}

export function useDataTableFilters<TData, TValue>({
  columns,
  columnFilters = [],
}: UseDataTableFiltersProps<TData, TValue>): UseDataTableFiltersReturn {
  // Filter states
  const [columnFiltersState, setColumnFiltersState] =
    React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  // Auto-discovered column filters
  const discoveredColumnFilters = React.useMemo(() => {
    // Only auto-discover if no columnFilters were provided
    if (columnFilters.length > 0) {
      return columnFilters;
    }

    // Find columns with filterFn defined
    return columns.reduce<ColumnFilter[]>((acc, col) => {
      // Check if column has filterFn defined
      const hasFilterFn = "filterFn" in col && col.filterFn;

      if (hasFilterFn) {
        const columnId =
          col.id ||
          ("accessorKey" in col ? String(col.accessorKey) : undefined);
        if (columnId) {
          // First check if there's a filterConfig in meta
          const colMeta = col.meta as Record<string, unknown> | undefined;
          if (colMeta && "filterConfig" in colMeta && colMeta.filterConfig) {
            // Use the filter config from meta
            acc.push(colMeta.filterConfig as ColumnFilter);
          }
          // If no filterConfig in meta, determine filter type based on column definition
          else if (
            col.filterFn === "numberRange" ||
            (typeof col.filterFn === "string" && col.filterFn.includes("range"))
          ) {
            // Create a range filter
            acc.push({
              type: "range",
              column: columnId,
              label: typeof col.header === "string" ? col.header : columnId,
            });
          } else if (col.filterFn === "starRating") {
            // Create a star rating filter
            acc.push({
              type: "starRating",
              column: columnId,
              label: typeof col.header === "string" ? col.header : columnId,
              maxStars:
                (col.meta as { maxStars?: number } | undefined)?.maxStars || 5,
            });
          } else {
            // Try to determine if this could be a select filter by checking for enumerable values
            // Safe check for meta.options property
            const hasOptions =
              colMeta && "options" in colMeta && Array.isArray(colMeta.options);

            if (hasOptions && colMeta.options) {
              // Create a select filter with options from meta
              acc.push({
                type: "select",
                column: columnId,
                label: typeof col.header === "string" ? col.header : columnId,
                options: colMeta.options as FilterOption[],
              });
            }
          }
        }
      }
      return acc;
    }, []);
  }, [columns, columnFilters]);

  return {
    columnFiltersState,
    setColumnFiltersState,
    globalFilter,
    setGlobalFilter,
    discoveredColumnFilters,
  };
}
