"use client"

import * as React from "react"
import { Cell, flexRender, ColumnDef } from "@tanstack/react-table"
import { DataTableCell } from "../cell"

interface DataTableCellProps<TData> {
  cell: Cell<TData, unknown>
}

/**
 * Table cell component that determines whether to use the DataTableCell renderer
 * or the default flexRender based on configuration
 */
export function TableCell<TData>({
  cell,
}: DataTableCellProps<TData>) {
  // Get the column definition
  const columnDef = cell.column.columnDef as ColumnDef<TData, unknown> & {
    cellRenderer?: { type: string; config?: Record<string, unknown> }
  }

  // If the column has a cellRenderer, use our DataTableCell component
  if (columnDef.cellRenderer) {
    return <DataTableCell cell={cell} />
  }

  // Otherwise, use the default rendering
  return (
    <div className="py-2 px-4">
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </div>
  )
} 