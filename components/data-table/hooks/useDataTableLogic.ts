import * as React from "react";
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  GroupingState,
  ExpandedState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  Table as ReactTable,
  Row,
  aggregationFns,
} from "@tanstack/react-table";
import { DataTableProps } from "../types";

import { 
  numberRangeFilterFn 
} from "../utils/filterFunctions";

import {
  firstAggregation,
  AggregationFunction,
} from "../utils/aggregationFunctions";

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
}

// --- Custom Hook: useDataTableLogic ---
export function useDataTableLogic<TData, TValue>({
  data,
  columns,
  enableGrouping = false,
  groupableColumns = [],
  defaultPageSize = 50,
}: DataTableProps<TData, TValue>): UseDataTableLogicReturn<TData> {
  // State
  const [isClient, setIsClient] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFiltersState, setColumnFiltersState] =
    React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [isGroupingDialogOpen, setIsGroupingDialogOpen] = React.useState(false);
  const [forceRenderCount, setForceRenderCount] = React.useState(0);

  // Refs
  const isMountedRef = React.useRef(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLTableSectionElement>(null);
  const rowRefsMap = React.useRef<Map<number, HTMLTableRowElement>>(new Map());

  // Table reference
  const tableRef = React.useRef<ReactTable<TData> | null>(null);

  // Effects
  React.useEffect(() => {
    isMountedRef.current = true;
    setIsClient(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memos
  const groupableColumnObjects = React.useMemo(() => {
    return groupableColumns.map((columnId) => {
      const col = columns.find(
        (c) =>
          c.id === columnId ||
          ("accessorKey" in c && c.accessorKey === columnId),
      );
      return {
        id: columnId,
        label:
          typeof col?.header === "string"
            ? col.header
            : columnId.charAt(0).toUpperCase() + columnId.slice(1),
      };
    });
  }, [columns, groupableColumns]);

  // Create a meta object for the table that includes several ways to force a rerender
  const tableMeta = React.useMemo(() => {
    return {
      forceRender: () => {
        if (isMountedRef.current) {
          // Increment a counter to force a rerender
          setForceRenderCount((count) => count + 1);
        }
      },
      recomputeAggregations: () => {
        if (isMountedRef.current && tableRef.current && grouping.length > 0) {
          // First, temporarily clear grouping
          const tempGrouping = [...grouping];
          tableRef.current.setGrouping([]);

          // Then restore it to force recalculation
          setTimeout(() => {
            if (tableRef.current) {
              tableRef.current.setGrouping(tempGrouping);
            }
          }, 0);
        }
      },
    };
  }, [grouping]);

  // Force table to recompute when forceRenderCount changes
  React.useEffect(() => {
    if (forceRenderCount > 0 && tableRef.current) {
      // Trigger table updates
      tableRef.current.setColumnVisibility({ ...columnVisibility });

      // Also reset expanded state to force recalculation
      if (grouping.length > 0) {
        tableRef.current.resetExpanded();
      }
    }
  }, [forceRenderCount, columnVisibility, grouping]);

  // Table Instance
  const table = useReactTable<TData>({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFiltersState,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: (updater) => {
      if (isMountedRef.current) {
        setGrouping(updater);
      } else {
        if (typeof updater === "function") {
          setGrouping((prev) => updater(prev));
        } else {
          setGrouping(updater);
        }
      }
    },
    getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),

    onPaginationChange: (updater) => {
      if (isMountedRef.current) {
        setPagination(updater);
      } else {
        if (typeof updater === "function") {
          setPagination((prev) => updater(prev));
        } else {
          setPagination(updater);
        }
      }
    },

    state: {
      sorting,
      columnFilters: columnFiltersState,
      globalFilter,
      columnVisibility,
      grouping,
      expanded,
      pagination,
    },

    filterFns: {
      numberRange: numberRangeFilterFn, // Add additional filter functions here
    },
    aggregationFns: {
      first: firstAggregation,
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

    // These options help with aggregation recalculation
    autoResetExpanded: false,

    defaultColumn: {
      size: 150,
      minSize: 50,
      maxSize: 500,
    },
    autoResetPageIndex: false,
    meta: tableMeta,

    debugTable: true,
  });

  // Store table reference for use in meta methods
  React.useEffect(() => {
    tableRef.current = table;
  }, [table]);

  const { rows } = table.getRowModel();

  // Ensure the returned object matches the interface
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
  };
}
