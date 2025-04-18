/**
 * Client-side table body component that handles row rendering and virtualization.
 * Implements efficient rendering strategies for large datasets while maintaining
 * smooth scrolling and interaction capabilities.
 */

import * as React from "react";
import { ColumnDef, GroupingState, Row } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

import { TableRowComponent } from "@/components/data-table/ui/row/Row";
import { useTableVirtualization } from "@/components/data-table/hooks/useTableVirtualization";
import { useStickyGroupHeaders } from "@/components/data-table/hooks/useStickyGroupHeaders";

// Update ClientTableBody props to be generic
interface ClientTableBodyProps<TData, TValue> {
  rows: Row<TData>[];
  tableContainerRef: React.RefObject<HTMLDivElement>;
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>;
  isMountedRef: React.RefObject<boolean>;
  grouping: GroupingState;
  columns: ColumnDef<TData, TValue>[];
  bodyUpdateCounter?: number; // Optional prop to force re-renders
}

// Create a client-only component for virtualized table body
export function ClientTableBody<TData, TValue>({
  rows,
  tableContainerRef,
  rowRefsMap,
  isMountedRef,
  grouping,
  columns,
  bodyUpdateCounter, // Add the prop here
}: ClientTableBodyProps<TData, TValue>) {
  // Setup virtualization
  const virtualizer = useTableVirtualization({
    rows,
    tableContainerRef,
    rowRefsMap,
    isMountedRef,
  });

  // Effect to re-initialize virtualizer when bodyUpdateCounter changes
  React.useEffect(() => {
    if (bodyUpdateCounter && bodyUpdateCounter > 0 && virtualizer) {
      // Force the virtualizer to recalculate
      virtualizer.measure();
    }
  }, [bodyUpdateCounter, virtualizer]);

  // Setup sticky headers
  const { stickyGroupHeaders } = useStickyGroupHeaders({
    rows,
    grouping,
    tableContainerRef,
    isMountedRef,
    virtualizer,
  });

  const virtualRows = virtualizer.getVirtualItems();

  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length} className="h-16 text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody
      style={{
        display: "block",
        position: "relative",
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        minWidth: "100%",
        contain: "strict",
        zIndex: 1,
      }}
      className="z-1 relative"
    >
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];
        return (
          <TableRowComponent
            key={row.id}
            row={row}
            rows={rows}
            virtualRow={virtualRow}
            rowRefsMap={rowRefsMap}
            virtualizer={virtualizer}
            grouping={grouping}
            stickyGroupHeaders={stickyGroupHeaders}
          />
        );
      })}
    </TableBody>
  );
}
