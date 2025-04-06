"use client"

import React from "react"
import { Cell, Row, ColumnDef } from "@tanstack/react-table"
import { getGlobalCellRendererRegistry } from "@/components/data-table/cell-renderers"
import { CellRendererProps } from "@/components/data-table/cell-renderers/types"

/**
 * Props for the DataTableCell component.
 * 
 * @template TData The type of data in the table rows
 * @property cell The TanStack Table cell instance containing value and context
 */
interface DataTableCellProps<TData> {
  cell: Cell<TData, unknown>
}

/**
 * A unified cell component that handles rendering of table cells.
 * 
 * This component acts as a smart wrapper around cell rendering, supporting:
 * - Regular cell values
 * - Aggregated values (when using grouping)
 * - Custom cell renderers through a registry system
 * - Grouped and expanded states
 * 
 * The component uses a cell renderer registry to determine how to display cell content.
 * If no specific renderer is defined, it falls back to basic text rendering.
 * 
 * @template TData The type of data in the table rows
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <DataTableCell cell={cell} />
 * 
 * // With custom renderer in column definition
 * const columns = [{
 *   id: 'status',
 *   cellRenderer: {
 *     type: 'badge',
 *     config: { colors: { active: 'green' } }
 *   }
 * }]
 * ```
 * 
 * @param props The component props
 * @param props.cell The TanStack Table cell instance
 * 
 * @returns A rendered cell with appropriate content based on configuration
 */
export function DataTableCell<TData>({ cell }: DataTableCellProps<TData>) {
  const registry = getGlobalCellRendererRegistry()
  const row = cell.getContext().row as Row<TData>
  const column = cell.column
  const columnDef = column.columnDef as ColumnDef<TData, unknown> & {
    cellRenderer?: { type: string; config?: Record<string, unknown> }
  }
  
  // Get cell renderer type from column definition
  const rendererType = columnDef.cellRenderer?.type || 'text'
  const rendererConfig = columnDef.cellRenderer?.config || {}
  
  // Get the cell renderer from registry
  const renderer = registry.get(rendererType)
  
  // Prepare props for the renderer
  const rendererProps: CellRendererProps = {
    row: {
      getValue: (columnId: string) => row.getValue(columnId),
      original: row.original,
    },
    column: {
      id: column.id,
    },
    getValue: () => cell.getValue(),
    isAggregated: Boolean(row.subRows?.length && row.getIsGrouped()),
    isGrouped: Boolean(row.getIsGrouped()),
    isExpanded: Boolean(row.getIsExpanded && row.getIsExpanded()),
  }
  
  // Render the cell using the appropriate renderer
  if (renderer) {
    return <>{renderer(rendererProps, rendererConfig)}</>
  }
  
  // Fallback to basic text rendering if no renderer found
  return <>{String(cell.getValue() ?? '')}</>
} 