"use client"

/**
 * Table Cell Module
 * 
 * This module provides a flexible table cell component that supports both custom
 * cell renderers and default rendering. It integrates with the data table's
 * cell rendering system and provides a consistent interface for cell content.
 * 
 * Features:
 * - Custom cell renderer support
 * - Default cell rendering
 * - Type-safe props
 * - Consistent styling
 * 
 * @module data-table/parts/table-cell
 */

import * as React from "react"
import { Cell, flexRender, ColumnDef } from "@tanstack/react-table"
import { DataTableCell } from "../core"

/**
 * Props for the TableCell component
 * 
 * @interface DataTableCellProps
 * @template TData - The type of data in the table
 */
interface DataTableCellProps<TData> {
  /** The cell to render */
  cell: Cell<TData, unknown>
}

/**
 * Table Cell Component
 * 
 * A flexible component that renders table cells with support for both custom
 * cell renderers and default rendering. It automatically determines the appropriate
 * rendering method based on the column configuration.
 * 
 * Features:
 * - Custom cell renderer support
 * - Default cell rendering
 * - Type-safe props
 * - Consistent styling
 * 
 * The component automatically:
 * - Checks for custom cell renderer configuration
 * - Uses DataTableCell for custom renderers
 * - Falls back to default rendering
 * - Applies consistent styling
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TableCell cell={cell} />
 * 
 * // With custom renderer
 * const columns = [
 *   {
 *     id: 'status',
 *     header: 'Status',
 *     cellRenderer: {
 *       type: 'badge',
 *       config: {
 *         colorMap: {
 *           active: 'green',
 *           inactive: 'red'
 *         }
 *       }
 *     }
 *   }
 * ]
 * ```
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