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
import { ExpandIcon, CollapseIcon } from "./icons"

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
 * Optimized to use React.Fragment where possible to reduce DOM nodes.
 */
export const DataTablePartCell = React.memo(
  function DataTablePartCellInner<TData>({
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
      
      // Return grouped cell with button in a fragment to minimize nodes
      return (
        <React.Fragment>
          {/* Add expand/collapse button next to grouped cells */}
          {row.subRows?.length > 0 && (
            <button
              className="mr-0.5 h-3 w-3 p-0 flex-shrink-0 align-middle"
              onClick={(e) => {
                e.stopPropagation()
                row.toggleExpanded()
              }}
              aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
            >
              {row.getIsExpanded() ? <CollapseIcon /> : <ExpandIcon />}
            </button>
          )}
          
          {/* Cell value */}
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
          
          {/* Show aggregation count */}
          <span className="ml-1 text-muted-foreground text-xs">
            {row.subRows.length > 0 && `(${row.subRows.length})`}
          </span>
        </React.Fragment>
      );
    }

    // Handle aggregated cells
    if (cell.getIsAggregated()) {
      const aggregationRenderer = columnDef.meta?.aggregationRenderer;
      
      // If column has a specified aggregation renderer, use that
      if (aggregationRenderer) {
        return (
          <DataTableAggregatedCell cell={cell as Cell<unknown, unknown>} />
        );
      }

      // Default rendering for aggregated value
      return (
        <React.Fragment>
          {flexRender(
            cell.column.columnDef.aggregatedCell || cell.column.columnDef.cell,
            cell.getContext()
          )}
        </React.Fragment>
      );
    }

    // Handle placeholder cells (part of a grouped row)
    if (cell.getIsPlaceholder()) {
      return <React.Fragment></React.Fragment>;
    }

    // Standard cell rendering
    return (
      <DataTableCell cell={cell as Cell<unknown, unknown>} />
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Compare the cell values
    const prevValue = prevProps.cell.getValue();
    const nextValue = nextProps.cell.getValue();
    const valuesEqual = prevValue === nextValue;
    
    // Compare grouped state
    const prevIsGrouped = prevProps.cell.getIsGrouped();
    const nextIsGrouped = nextProps.cell.getIsGrouped();
    
    // Compare aggregated state
    const prevIsAggregated = prevProps.cell.getIsAggregated();
    const nextIsAggregated = nextProps.cell.getIsAggregated();
    
    // Compare expanded state if grouped
    let expandedEqual = true;
    if (prevIsGrouped && nextIsGrouped) {
      const prevRow = prevProps.cell.getContext().row;
      const nextRow = nextProps.cell.getContext().row;
      expandedEqual = prevRow.getIsExpanded() === nextRow.getIsExpanded();
    }
    
    // Return true if all relevant properties are equal (preventing re-render)
    return valuesEqual && 
           prevIsGrouped === nextIsGrouped && 
           prevIsAggregated === nextIsAggregated &&
           expandedEqual;
  }
) 