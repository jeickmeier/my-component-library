import * as React from "react";
import { Row, flexRender, GroupingState } from "@tanstack/react-table";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

// Update the TableRowProps interface to include all rows
interface TableRowProps<TData> {
  row: Row<TData>;
  rows: Row<TData>[];
  virtualRow: VirtualItem;
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>;
  virtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
  grouping: GroupingState;
  stickyGroupHeaders?: number[];
}

// Update the TableRowComponent function
export function TableRowComponent<TData>({
  row,
  rows,
  virtualRow,
  rowRefsMap,
  virtualizer,
  grouping,
  stickyGroupHeaders = [],
}: TableRowProps<TData>) {
  // Determine if this row should be sticky
  const isParentRow =
    row.subRows && row.subRows.length > 0 && grouping.length > 0;
  const rowIndex = rows.findIndex((r: Row<TData>) => r.id === row.id);
  const isSticky = isParentRow && stickyGroupHeaders.includes(rowIndex);

  // Find the position in the sticky stack (0 = top, 1 = second from top, etc.)
  const stickyPosition = isSticky
    ? stickyGroupHeaders.findIndex((index) => index === rowIndex)
    : -1;

  // Calculate the top position based on stack position
  const stickyTop = isSticky
    ? stickyGroupHeaders.slice(0, stickyPosition).reduce((total, idx) => {
        const el = rowRefsMap.current?.get(idx);
        return total + (el?.offsetHeight || 35); // Use 35 as fallback height
      }, 0)
    : undefined;

  // Z-index needs to be lower than the table header but still stacking properly
  const stickyZIndex = isSticky
    ? 1000 - stickyPosition // High z-index but lower than header's 2000
    : undefined;

  return (
    <TableRow
      data-index={virtualRow.index}
      data-state={row.getIsSelected() && "selected"}
      className={isSticky ? "sticky-group-header" : ""}
      ref={(node: HTMLTableRowElement | null) => {
        if (node) {
          // Measure the element for dynamic height
          virtualizer.measureElement?.(node);
          // Store reference to update position later
          rowRefsMap.current?.set(virtualRow.index, node);
        }
      }}
      style={{
        position: isSticky ? "sticky" : "absolute",
        top: isSticky ? stickyTop : 0,
        left: 0,
        width: "100%",
        height: `${virtualRow.size}px`,
        transform: isSticky ? "none" : `translateY(${virtualRow.start}px)`,
        display: "flex",
        alignItems: "center",
        zIndex: stickyZIndex,
        backgroundColor: isSticky ? "var(--background)" : undefined,
        boxShadow: isSticky ? "0 1px 3px rgba(0,0,0,0.1)" : undefined,
        borderBottom: isSticky ? "1px solid var(--border)" : undefined,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={grouping.includes(cell.column.id) ? "font-medium" : ""}
          style={{
            flex: cell.column.getSize() ? `${cell.column.getSize()} 0 0` : 1,
            width: cell.column.getSize()
              ? `${cell.column.getSize()}px`
              : "auto",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {grouping.includes(cell.column.id) && row.subRows?.length > 0 ? (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 h-4 w-4 p-0"
                onClick={() => {
                  row.toggleExpanded();
                }}
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <span
                style={{
                  paddingLeft: `${row.depth * 2}rem`,
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({row.subRows.length})
              </span>
            </div>
          ) : (
            <span
              style={{
                paddingLeft: `${row.depth * 2}rem`,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}
