/**
 * Hook that implements sticky header functionality for grouped rows in the table.
 * Handles scroll synchronization and positioning of group headers to ensure they
 * remain visible while scrolling through grouped data.
 */

import * as React from "react";
import { GroupingState, Row } from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";

interface UseStickyGroupHeadersOptions<TData> {
  rows: Row<TData>[];
  grouping: GroupingState;
  tableContainerRef: React.RefObject<HTMLDivElement>;
  isMountedRef: React.RefObject<boolean>;
  virtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}

export function useStickyGroupHeaders<TData>({
  rows,
  grouping,
  tableContainerRef,
  isMountedRef,
  virtualizer,
}: UseStickyGroupHeadersOptions<TData>) {
  const [stickyGroupHeaders, setStickyGroupHeaders] = React.useState<number[]>(
    [],
  );

  // Compute sticky group headers when scrolling
  React.useEffect(() => {
    if (!rows.length || grouping.length === 0) {
      setStickyGroupHeaders([]);
      return;
    }

    const handleScroll = () => {
      if (!isMountedRef.current || !tableContainerRef.current) return;

      const scrollTop = tableContainerRef.current.scrollTop;
      const visibleVirtualRows = virtualizer.getVirtualItems();

      if (!visibleVirtualRows.length) {
        setStickyGroupHeaders([]);
        return;
      }

      // Find the first visible row index
      const firstVisibleIndex = visibleVirtualRows[0].index;

      // Find all parent group rows that are ancestors of currently visible rows
      const parentIndices: number[] = [];

      // Process each visible row to find its parent groups
      for (const virtualRow of visibleVirtualRows) {
        const currentRow = rows[virtualRow.index];

        // Skip if already processed
        if (parentIndices.includes(virtualRow.index)) continue;

        // Only process rows that have parents
        if (currentRow.depth > 0) {
          // Start with current row and walk up the parent chain
          let rowToCheck = currentRow;
          while (rowToCheck.depth > 0) {
            const parentRow = rowToCheck.getParentRow?.();
            if (parentRow) {
              const parentIndex = rows.findIndex((r) => r.id === parentRow.id);
              if (parentIndex >= 0 && !parentIndices.includes(parentIndex)) {
                parentIndices.push(parentIndex);
              }
              rowToCheck = parentRow;
            } else {
              break;
            }
          }
        }
      }

      // A parent row should be sticky if:
      // 1. It's a parent of currently visible rows
      // 2. It's not currently visible itself or is at the very top of the viewport
      const stickyHeaders = parentIndices.filter((index) => {
        return (
          index < firstVisibleIndex ||
          (index === firstVisibleIndex && scrollTop > 0)
        );
      });

      // Sort by depth to ensure proper stacking
      const sortedHeaders = [...stickyHeaders].sort((a, b) => {
        // First by depth (to keep hierarchical structure)
        const depthDiff = rows[a].depth - rows[b].depth;
        if (depthDiff !== 0) return depthDiff;

        // Then by row index
        return a - b;
      });

      // Update state using functional update to avoid dependency loop
      setStickyGroupHeaders((currentStickyHeaders) => {
        if (
          JSON.stringify(sortedHeaders) !== JSON.stringify(currentStickyHeaders)
        ) {
          return sortedHeaders;
        }
        return currentStickyHeaders;
      });
    };

    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial calculation

      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, [rows, grouping, tableContainerRef, isMountedRef, virtualizer]);

  return { stickyGroupHeaders, setStickyGroupHeaders };
}
