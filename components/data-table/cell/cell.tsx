"use client"

import React from "react"
import { Cell, Row, ColumnDef } from "@tanstack/react-table"
import { getGlobalCellRendererRegistry } from "../cell-renderers"
import { CellRendererProps } from "../cell-renderers/core/types"

interface DataTableCellProps<TData> {
  cell: Cell<TData, unknown>
}

/**
 * A unified cell component that handles both normal and aggregated cells
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
  
  // Render the cell
  if (renderer) {
    return <>{renderer(rendererProps, rendererConfig)}</>
  }
  
  // Fallback rendering
  return <>{String(cell.getValue() ?? '')}</>
} 