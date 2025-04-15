/**
 * Table row component that handles rendering of individual rows in the data table.
 * Supports virtualization, grouping, sticky headers, and custom cell rendering
 * while maintaining proper styling and accessibility features.
 */

import * as React from "react";
import { Row, flexRender, GroupingState } from "@tanstack/react-table";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Interface defining the properties required for rendering a table row.
 * @param row - The current row being rendered
 * @param rows - All rows in the table, needed for determining row indices
 * @param virtualRow - Virtual row information from react-virtual for virtualization
 * @param rowRefsMap - Map of row references to manage sticky header positioning
 * @param virtualizer - Virtualizer instance for dynamic height management
 * @param grouping - Current grouping state that affects row rendering and hierarchy
 * @param stickyGroupHeaders - Array of row indices that should be sticky (parent group headers)
 */
interface TableRowProps<TData> {
  row: Row<TData>;
  rows: Row<TData>[];
  virtualRow: VirtualItem;
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>;
  virtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
  grouping: GroupingState;
  stickyGroupHeaders?: number[];
}

/**
 * Renders a table row with support for grouping, virtualization, and sticky headers.
 * 
 * Rendering logic flow:
 * 1. Determines if row is a parent row (has subRows and grouping is active)
 * 2. Calculates sticky positioning for parent rows if needed
 * 3. Renders each cell with appropriate content based on grouping context
 * 
 * Cell content rendering rules:
 * - Parent rows with subRows show expand/collapse controls for the active grouping level
 * - Group header cells include the count of subrows in parentheses
 * - Leaf nodes (rows without children) don't display content for grouped columns 
 * - Cells are indented based on their depth in the grouping hierarchy
 * 
 * @returns A table row with properly styled and positioned cells
 */
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

  /**
   * Calculate sticky positioning properties:
   * - stickyPosition: Position in the stack of sticky headers (0 = top, 1 = second from top, etc.)
   * - stickyTop: Calculated top position based on heights of headers above this one
   * - stickyZIndex: Z-index value to ensure proper stacking of sticky headers
   */
  const stickyPosition = isSticky
    ? stickyGroupHeaders.findIndex((index) => index === rowIndex)
    : -1;

  const stickyTop = isSticky
    ? stickyGroupHeaders.slice(0, stickyPosition).reduce((total, idx) => {
        const el = rowRefsMap.current?.get(idx);
        return total + (el?.offsetHeight || 24); // Further reduce fallback height
      }, 0)
    : undefined;

  const stickyZIndex = isSticky
    ? 1000 - stickyPosition // High z-index but lower than header's 2000
    : undefined;

  /**
   * Handles row click events - toggles expansion for parent rows
   */
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
      } ${isParentRow && row.depth === 0 ? "bg-gray-100 cursor-pointer" : ""} py-0`}
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
        /**
         * Cell content visibility logic:
         * 1. Determine if this column is used for grouping
         * 2. Check if this column is the "active" grouping level for this row
         * 3. For leaf nodes, hide content in grouped columns
         * 4. Show content only if the column is not grouped OR it's the active grouping level
         */
        const columnIndex = grouping.indexOf(cell.column.id);
        const isActiveGroupingLevel = columnIndex === row.depth;
        
        const isGroupedColumn = grouping.includes(cell.column.id);
        const shouldHideInLeafNode = isLeafNode && isGroupedColumn;
        const shouldShowContent = (!isGroupedColumn || isActiveGroupingLevel) && !shouldHideInLeafNode;
        
        // For leaf nodes with grouped columns, render empty cells to maintain structure
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
                    paddingLeft: `${row.depth * 1.5}rem`,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {/* 
                   * For parent rows at their active grouping level:
                   * 1. Show expand/collapse button
                   * 2. When expanded, show chevron down; when collapsed, show chevron right
                   */}
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
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                  {/* 
                   * Cell content rendering:
                   * 1. For grouped columns, show cell content only at the active level
                   * 2. For active grouping levels, show number of children in parentheses
                   * 3. For aggregated cells, use special aggregatedCell renderer if provided
                   */}
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
                        <span className="ml-2 text-muted-foreground">
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
                  paddingLeft: isGroupedColumn ? `${row.depth * 1.5}rem` : 0,
                }}
              >
                {/* 
                 * For non-group cells or leaf nodes:
                 * 1. Render cell content with appropriate indentation
                 * 2. Use aggregatedCell renderer for aggregated cells if available
                 */}
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
