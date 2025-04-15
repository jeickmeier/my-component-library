/**
 * Hook that implements data grouping functionality for the table. Handles group
 * expansion state, group aggregation, and provides utilities for group-related
 * operations like expanding/collapsing groups.
 */

import * as React from "react";
import { GroupingState, ExpandedState, ColumnDef } from "@tanstack/react-table";

interface UseDataTableGroupingProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  enableGrouping?: boolean;
  groupableColumns?: string[];
  defaultExpanded?: boolean | number | Record<string, boolean>;
  defaultGrouping?: string[];
}

interface UseDataTableGroupingReturn {
  grouping: GroupingState;
  setGrouping: React.Dispatch<React.SetStateAction<GroupingState>>;
  expanded: ExpandedState;
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>;
  isGroupingDialogOpen: boolean;
  setIsGroupingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  groupableColumnObjects: { id: string; label: string }[];
}

export function useDataTableGrouping<TData, TValue>({
  columns,
  enableGrouping = false,
  groupableColumns = [],
  defaultExpanded,
  defaultGrouping,
}: UseDataTableGroupingProps<TData, TValue>): UseDataTableGroupingReturn {
  // Grouping states
  const [grouping, setGrouping] = React.useState<GroupingState>(
    defaultGrouping ?? [],
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>(() => {
    if (defaultExpanded === true) {
      return true; // Expand all
    } else if (typeof defaultExpanded === "object") {
      return defaultExpanded; // Expand specific groups
    } else {
      // Covers false, undefined, and now number
      return {}; // Default: no expansion
    }
  });
  const [isGroupingDialogOpen, setIsGroupingDialogOpen] = React.useState(false);

  // Compute groupable columns
  const groupableColumnObjects = React.useMemo(() => {
    if (!enableGrouping) return [];

    // Auto-discover groupable columns from column definitions if no explicit list provided
    const autoDiscoveredGroupableColumns = columns.reduce(
      (acc: string[], col) => {
        // Check if column is explicitly marked as groupable
        if ("enableGrouping" in col && col.enableGrouping === true) {
          const columnId =
            col.id ||
            ("accessorKey" in col ? String(col.accessorKey) : undefined);
          if (columnId) {
            acc.push(columnId);
          }
        }
        return acc;
      },
      [],
    );

    // Use provided groupableColumns if defined, otherwise use auto-discovered columns
    const columnsToUse =
      groupableColumns.length > 0
        ? groupableColumns
        : autoDiscoveredGroupableColumns;

    return columnsToUse.map((columnId) => {
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
  }, [columns, groupableColumns, enableGrouping]);

  return {
    grouping,
    setGrouping,
    expanded,
    setExpanded,
    isGroupingDialogOpen,
    setIsGroupingDialogOpen,
    groupableColumnObjects,
  };
}
