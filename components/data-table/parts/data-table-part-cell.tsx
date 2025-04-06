"use client"

/**
 * @module data-table/parts/data-table-part-cell
 * @description Renders table cells, supporting default rendering or custom cell renderers
 * defined in the column definition.
 */

// React + Lib Imports
import * as React from "react"
import { Cell, flexRender } from "@tanstack/react-table"

// Internal Imports
import { DataTableColumnDef, SerializableCellRenderer } from "../types"
import { DataTableCell, DataTableAggregatedCell } from "../core"

/**
 * Props for the DataTablePartCell component
 * 
 * @interface DataTablePartCellProps
 * @template TData - The type of data in the table
 */
interface DataTablePartCellProps<TData> {
  /** The cell to render */
  cell: Cell<TData, unknown>
}

/**
 * Renders a single table cell content based on its type.
 * Handles grouped cells, aggregated cells with optional renderers, and normal cells.
 */
export function DataTablePartCell<TData>({
  cell,
}: DataTablePartCellProps<TData>) {
  // Get the column definition using the centralized type
  const columnDef = cell.column.columnDef as DataTableColumnDef<TData> & {
    // Explicitly type meta for easier access
    meta?: {
      aggregationRenderer?: SerializableCellRenderer;
      // other meta properties...
    };
  };

  // Handle grouped cells (with expand/collapse buttons, etc.)
  if (cell.getIsGrouped()) {
    // Get the row from context
    const row = cell.getContext().row;
    return (
      <div className="flex items-center">
        {/* Add expand/collapse button next to grouped cells */}
        {row.subRows?.length > 0 && (
          <button
            className="mr-0.5 h-3 w-3 p-0 flex-shrink-0 align-middle"
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
        {flexRender(
          cell.column.columnDef.cell,
          cell.getContext()
        )}
        <span className="ml-1 text-xs text-muted-foreground">
          ({row.subRows.length})
        </span>
      </div>
    );
  }

  // Handle aggregated cells with aggregationRenderer
  if (cell.getIsAggregated()) {
    const aggRenderer = columnDef.meta?.aggregationRenderer;

    // Use the DataTableAggregatedCell component if there's a custom renderer
    if (aggRenderer) {
      return <DataTableAggregatedCell cell={cell} />;
    }

    // Otherwise fall back to default rendering
    return (
      <span className="font-semibold">
        {flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())}
      </span>
    );
  }

  // Handle placeholder cells
  if (cell.getIsPlaceholder()) {
    return null;
  }

  // Handle regular cells
  if (columnDef.cellRenderer) {
    return <DataTableCell cell={cell} />;
  }

  // Fall back to default rendering for normal cells
  return flexRender(
    cell.column.columnDef.cell,
    cell.getContext()
  );
} 