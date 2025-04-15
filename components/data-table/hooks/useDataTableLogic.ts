/**
 * Core hook that implements the main data table logic including sorting, pagination,
 * column visibility, and row selection. Integrates with TanStack Table to provide
 * the core table functionality and state management.
 */

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  Table as ReactTable,
  Row,
  aggregationFns,
  GroupingState,
  ExpandedState,
} from "@tanstack/react-table";
import { DataTableProps, ColumnFilter } from "@/components/data-table/types";
import { numberRangeFilterFn, starRatingFilterFn } from "@/components/data-table/utils/filterFunctions";
import { firstAggregation, lastAggregation, sparklineAggregation, AggregationFunction } from "@/components/data-table/utils/aggregationFunctions";

// Import custom hooks
import { useDataTableFilters } from "@/components/data-table/hooks/useDataTableFilters";
import { useDataTableGrouping } from "@/components/data-table/hooks/useDataTableGrouping";
import { useDataTableState } from "@/components/data-table/hooks/useDataTableState";
import { useDataTableRefs } from "@/components/data-table/hooks/useDataTableRefs";

// Define the explicit return type for the hook
interface UseDataTableLogicReturn<TData> {
  table: ReactTable<TData>;
  rows: Row<TData>[];
  isClient: boolean;
  grouping: GroupingState;
  setGrouping: React.Dispatch<React.SetStateAction<GroupingState>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  isGroupingDialogOpen: boolean;
  setIsGroupingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLTableSectionElement | null>;
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>;
  isMountedRef: React.RefObject<boolean>;
  groupableColumnObjects: { id: string; label: string }[];
  columnOrder: string[];
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  discoveredColumnFilters: ColumnFilter[];
}

// --- Custom Hook: useDataTableLogic ---
export function useDataTableLogic<TData, TValue>({
  data,
  columns,
  enableGrouping = false,
  groupableColumns = [],
  columnFilters = [],
  defaultPageSize = 50,
  defaultExpanded,
  defaultGrouping,
}: DataTableProps<TData, TValue>): UseDataTableLogicReturn<TData> {
  // Use the custom hooks
  const {
    columnFiltersState,
    setColumnFiltersState,
    globalFilter,
    setGlobalFilter,
    discoveredColumnFilters,
  } = useDataTableFilters({ columns, columnFilters });

  const {
    grouping,
    setGrouping,
    expanded,
    setExpanded,
    isGroupingDialogOpen,
    setIsGroupingDialogOpen,
    groupableColumnObjects,
  } = useDataTableGrouping({ columns, enableGrouping, groupableColumns, defaultExpanded, defaultGrouping });

  const {
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    pagination,
    setPagination,
    createTableMeta,
  } = useDataTableState({ defaultPageSize, isMountedRef: React.useRef(false) });

  const {
    isClient,
    isMountedRef,
    tableContainerRef,
    headerRef,
    rowRefsMap,
    tableRef,
  } = useDataTableRefs<TData>();

  // Table Instance
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFiltersState,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onGroupingChange: setGrouping,
    getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    onPaginationChange: setPagination,

    state: {
      sorting,
      columnFilters: columnFiltersState,
      globalFilter,
      columnVisibility,
      grouping,
      expanded,
      pagination,
      columnOrder,
    },

    filterFns: {
      numberRange: numberRangeFilterFn,
      starRating: starRatingFilterFn,
    },
    aggregationFns: {
      first: firstAggregation,
      last: lastAggregation,
      sparkline: sparklineAggregation,
      
      sum: aggregationFns.sum,
      count: aggregationFns.count,
      min: aggregationFns.min,
      max: aggregationFns.max,
      mean: aggregationFns.mean,
      median: aggregationFns.median,
      unique: aggregationFns.unique,
      uniqueCount: aggregationFns.uniqueCount,
      extent: aggregationFns.extent,
    } as Record<string, AggregationFunction>,

    enableGrouping,
    manualGrouping: !enableGrouping,
    autoResetExpanded: false,
    defaultColumn: {
      size: 150,
      minSize: 50,
      maxSize: 500,
    },
    autoResetPageIndex: false,
    meta: createTableMeta<TData>(tableRef, grouping),
    debugTable: true,
  });

  // Store table reference
  React.useEffect(() => {
    if (tableRef.current !== table) {
      tableRef.current = table;
    }
  }, [table, tableRef]);

  // Effect to handle numeric defaultExpanded after rows are available
  React.useEffect(() => {
    // Check if defaultExpanded is a number and greater than 0
    if (typeof defaultExpanded === 'number' && defaultExpanded > 0) {
      // Defer execution slightly to allow table rows to process
      const timeoutId = setTimeout(() => {
        const newExpandedState: ExpandedState = {};
        // Iterate over the row model after grouping/expansion models have run
        table.getRowModel().rows.forEach(row => {
          // Expand rows whose depth is less than the specified level
          // row.depth is 0-indexed, defaultExpanded is 1-indexed level
          if (row.depth < defaultExpanded) {
            newExpandedState[row.id] = true;
          }
        });
        // Only update state if there are rows to expand
        if (Object.keys(newExpandedState).length > 0) {
          setExpanded(newExpandedState);
        }
      }, 0); // setTimeout with 0ms delay

      // Cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timeoutId);
    }
    // Dependencies: run only when these change.
    // table instance should be stable, setExpanded is stable.
    // defaultExpanded triggers the effect if it changes.
  }, [defaultExpanded, setExpanded, table]); 

  const { rows } = table.getRowModel();

  return {
    table,
    rows,
    isClient,
    grouping,
    setGrouping,
    globalFilter,
    setGlobalFilter,
    isGroupingDialogOpen,
    setIsGroupingDialogOpen,
    tableContainerRef,
    headerRef,
    rowRefsMap,
    isMountedRef,
    groupableColumnObjects,
    columnOrder,
    setColumnOrder,
    discoveredColumnFilters,
  };
}
