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
  const isLeafNode = !row.subRows || row.subRows.length === 0;
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

  // Handle row click for parent rows
  const handleRowClick = () => {
    if (isParentRow) {
      row.toggleExpanded();
    }
  };

  return (
    <TableRow
      data-index={virtualRow.index}
      data-state={row.getIsSelected() && "selected"}
      className={`flex items-center w-full ${
        isSticky ? "sticky backdrop-blur bg-background/95 border-b border-border z-5" : ""
      } ${isParentRow ? "bg-gray-100 cursor-pointer" : ""}`}
      onClick={handleRowClick}
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
        height: `${virtualRow.size}px`,
        transform: isSticky ? "none" : `translateY(${virtualRow.start}px)`,
        zIndex: stickyZIndex,
      }}
    >
      {row.getVisibleCells().map((cell) => {
        // Determine if this column is the active grouping level
        const columnIndex = grouping.indexOf(cell.column.id);
        const isActiveGroupingLevel = columnIndex === row.depth;
        
        // If this is a grouped column and not the active level, we may want to hide content
        const isGroupedColumn = grouping.includes(cell.column.id);
        const shouldHideInLeafNode = isLeafNode && isGroupedColumn;
        const shouldShowContent = (!isGroupedColumn || isActiveGroupingLevel || row.depth === 0) && !shouldHideInLeafNode;
        
        // If this is a leaf node with a grouping column, return empty cell or minimal content
        if (shouldHideInLeafNode) {
          return (
            <TableCell
              key={cell.id}
              style={{
                flex: cell.column.getSize() ? `${cell.column.getSize()} 0 0` : 1,
                width: cell.column.getSize()
                  ? `${cell.column.getSize()}px`
                  : "auto",
              }}
            >
              {/* Empty space instead of grouped column content for leaf nodes */}
            </TableCell>
          );
        }
        
        return (
          <TableCell
            key={cell.id}
            className={`overflow-hidden text-ellipsis whitespace-nowrap ${
              isGroupedColumn ? "font-medium" : ""
            }`}
            style={{
              flex: cell.column.getSize() ? `${cell.column.getSize()} 0 0` : 1,
              width: cell.column.getSize()
                ? `${cell.column.getSize()}px`
                : "auto",
            }}
          >
            {isGroupedColumn && row.subRows?.length > 0 ? (
              <div className="flex items-center">
                <div
                  style={{
                    paddingLeft: `${row.depth * 2}rem`,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {isActiveGroupingLevel && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-1 h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        row.toggleExpanded();
                      }}
                    >
                      {row.getIsExpanded() ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {shouldShowContent && (
                    <>
                      <span className="block overflow-hidden text-ellipsis">
                        {flexRender(
                          cell.getIsAggregated() && cell.column.columnDef.aggregatedCell
                            ? cell.column.columnDef.aggregatedCell
                            : cell.column.columnDef.cell, 
                          cell.getContext()
                        )}
                      </span>
                      {isActiveGroupingLevel && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({row.subRows.length})
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <span
                className="block overflow-hidden text-ellipsis"
                style={{
                  paddingLeft: isGroupedColumn ? `${row.depth * 2}rem` : 0,
                }}
              >
                {flexRender(
                  cell.getIsAggregated() && cell.column.columnDef.aggregatedCell
                    ? cell.column.columnDef.aggregatedCell
                    : cell.column.columnDef.cell, 
                  cell.getContext()
                )}
              </span>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
