"use client"

import React from "react"
import { Cell, Row } from "@tanstack/react-table"
import { getGlobalCellRendererRegistry } from "@/components/data-table/cell-renderers"
import { CellRendererProps } from "@/components/data-table/cell-renderers/types"
import { DataTableColumnDef } from "../types"

/**
 * Props for the DataTableAggregatedCell component.
 * 
 * @template TData The type of data in the table rows
 * @property cell The TanStack Table cell instance containing value and context
 */
interface DataTableAggregatedCellProps<TData> {
  cell: Cell<TData, unknown>
}

/**
 * A cell component specifically for rendering aggregated cells.
 * 
 * This component uses the `aggregationRenderer` defined in the column's meta
 * configuration to render the aggregated cell content using the cell renderer registry.
 * 
 * @param props The component props
 * @param props.cell The TanStack Table cell instance (should be an aggregated cell)
 * @returns A rendered cell with appropriate content based on aggregation renderer config
 */
export const DataTableAggregatedCell = React.memo(
  function DataTableAggregatedCellInner<TData = unknown>({ cell }: DataTableAggregatedCellProps<TData>) {
    const registry = getGlobalCellRendererRegistry()
    const row = cell.getContext().row as Row<TData>
    const column = cell.column
    
    // Get the column definition with the correct type
    const columnDef = column.columnDef as DataTableColumnDef<TData>
    
    // Get aggregation renderer type and config from column definition
    const rendererType = columnDef.aggregationRenderer?.type || 'text' // Default to text if somehow missing
    const rendererConfig = columnDef.aggregationRenderer?.config || {}
    
    // Get the cell renderer from registry (using the aggregation renderer type)
    const renderer = registry.get(rendererType)
    
    // Prepare props for the renderer
    const rendererProps: CellRendererProps = {
      // Pass row context (though less relevant for aggregated cells typically)
      row: {
        getValue: (columnId: string) => row.getValue(columnId),
        original: row.original,
      },
      column: {
        id: column.id,
      },
      // Use the aggregated value
      getValue: () => cell.getValue(), 
      isAggregated: true, // This cell is always aggregated
      isGrouped: true, // Aggregated cells only appear in grouped rows
      isExpanded: Boolean(row.getIsExpanded && row.getIsExpanded()),
    }
    
    // Render the cell using the appropriate renderer
    if (renderer && typeof renderer === 'function') {
      return <>{renderer(rendererProps, rendererConfig)}</>
    }
    
    // Fallback to basic text rendering if no renderer found (should ideally not happen)
    return <>{String(cell.getValue() ?? '')}</>
  },
  // Custom comparison function for memoization
  (prevProps, nextProps) => {
    // Compare cell values
    const prevValue = prevProps.cell.getValue();
    const nextValue = nextProps.cell.getValue();
    
    // Get rows to compare expanded state
    const prevRow = prevProps.cell.getContext().row;
    const nextRow = nextProps.cell.getContext().row;
    
    // Check if expanded state is the same
    const expandedEqual = prevRow.getIsExpanded() === nextRow.getIsExpanded();
    
    // Skip re-rendering if values and expanded state are the same
    return prevValue === nextValue && expandedEqual;
  }
) 