"use client"

/**
 * Table Body Module
 * 
 * This module provides the table body component that renders the data rows and cells
 * of the table. It handles row rendering, cell alignment, grouping, aggregation,
 * and expandable rows.
 * 
 * Features:
 * - Row and cell rendering
 * - Automatic cell alignment
 * - Grouping support
 * - Aggregation display
 * - Expandable rows
 * - Empty state handling
 * - Responsive design
 * 
 * @module data-table/parts/table-body
 */

import * as React from "react"
import { Row, Cell } from "@tanstack/react-table"
import { useDataTable } from "../core/context"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { DataTablePartCell } from "./data-table-part-cell"

/**
 * Table Body Component
 * 
 * Renders the body section of the data table, including all rows and cells.
 * The component handles various cell types (grouped, aggregated, placeholder)
 * and provides automatic alignment based on data type.
 * 
 * Features:
 * - Row and cell rendering
 * - Automatic cell alignment based on data type
 * - Grouping support with expand/collapse
 * - Aggregation display
 * - Empty state handling
 * - Responsive design
 * 
 * The component automatically:
 * - Renders all rows and cells
 * - Applies appropriate alignment
 * - Handles grouped and aggregated cells
 * - Shows expand/collapse buttons for grouped rows
 * - Displays row counts for grouped cells
 * - Shows an empty state when no data is available
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TableBody />
 * 
 * // With grouping
 * const columns = [
 *   {
 *     id: 'category',
 *     header: 'Category',
 *     enableGrouping: true
 *   },
 *   {
 *     id: 'value',
 *     header: 'Value',
 *     aggregationFn: 'sum'
 *   }
 * ]
 * ```
 */
export function TableBodyComponent() {
  const { 
    table, 
    schema,
    grouping,
  } = useDataTable<unknown>()
  
  // Keep track of the last seen parent values for each depth level
  const lastParentValues = React.useRef<Record<number, string>>({})
  
  if (!table.getRowModel().rows?.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={schema.columns.length}
            className="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody>
      {table.getRowModel().rows.map((row: Row<unknown>) => {
        // Reset tracking when we're at the root level
        if (row.depth === 0) {
          lastParentValues.current = {}
        }

        return (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className="h-8"
          >
            {row.getVisibleCells().map((cell: Cell<unknown, unknown>, cellIndex: number) => {
              // Determine alignment class
              let alignmentClass = ''
              
              // Check if column has explicit alignment set
              const columnDef = cell.column.columnDef as unknown as { 
                alignment?: 'left' | 'center' | 'right';
              }
              if (columnDef.alignment) {
                alignmentClass = `text-${columnDef.alignment}`
              }
              // Otherwise use auto-detection based on data type
              else {
                const value = cell.getValue()
                
                // Align numbers to the right
                if (typeof value === 'number') {
                  alignmentClass = 'text-right'
                }
                // Align dates to the center
                else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value as string)))) {
                  alignmentClass = 'text-center'
                }
              }

              const isGroupedColumn = grouping.includes(cell.column.id)
              
              return (
                <TableCell 
                  key={cell.id}
                  className={`p-1 py-1 align-middle ${alignmentClass} ${isGroupedColumn ? "font-medium" : ""}`}
                >
                  {/* Render using DataTablePartCell - Simplify the content */}
                  <span style={{ paddingLeft: cellIndex === 0 ? `${row.depth * 1}rem` : 0 }}>
                    <DataTablePartCell cell={cell} />
                  </span>
                </TableCell>
              )
            })}
          </TableRow>
        )
      })}
    </TableBody>
  )
} 