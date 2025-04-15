/**
 * Hook for managing the data table's internal state including column visibility,
 * sorting, pagination, and row selection states. Provides controlled and uncontrolled
 * state management options with persistence capabilities.
 */

import * as React from "react";
import {
  SortingState,
  VisibilityState,
  ColumnOrderState,
  Table as ReactTable,
  GroupingState,
} from "@tanstack/react-table";

interface UseDataTableStateProps {
  defaultPageSize?: number;
  isMountedRef: React.RefObject<boolean>;
}

interface UseDataTableStateReturn {
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  columnOrder: ColumnOrderState;
  setColumnOrder: React.Dispatch<React.SetStateAction<ColumnOrderState>>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: React.Dispatch<
    React.SetStateAction<{ pageIndex: number; pageSize: number }>
  >;
  forceRenderCount: number;
  setForceRenderCount: React.Dispatch<React.SetStateAction<number>>;
  createTableMeta: <TData>(
    tableRef: React.MutableRefObject<ReactTable<TData> | null>,
    grouping: GroupingState,
  ) => {
    forceRender: () => void;
    recomputeAggregations: () => void;
  };
}

export function useDataTableState({
  defaultPageSize = 50,
  isMountedRef,
}: UseDataTableStateProps): UseDataTableStateReturn {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [forceRenderCount, setForceRenderCount] = React.useState(0);

  // Create table meta object factory
  const createTableMeta = React.useCallback(
    <TData>(
      tableRef: React.MutableRefObject<ReactTable<TData> | null>,
      grouping: GroupingState,
    ) => {
      return {
        forceRender: () => {
          if (isMountedRef.current) {
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
    },
    [isMountedRef],
  );

  return {
    sorting,
    setSorting,
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    pagination,
    setPagination,
    forceRenderCount,
    setForceRenderCount,
    createTableMeta,
  };
}
