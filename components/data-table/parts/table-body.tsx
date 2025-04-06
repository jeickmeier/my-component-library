"use client"

import * as React from "react"
import { flexRender, Row, Cell, Table } from "@tanstack/react-table"
import { useDataTable } from "../core/context"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

/**
 * TableBody component for the data table
 * 
 * Renders the table body with rows and cells.
 */
export function TableBodyComponent() {
  const { 
    table, 
    schema,
    grouping,
  } = useDataTable<unknown>()
  
  // Cast table to the correct type
  const typedTable = table as Table<unknown>

  // Keep track of the last seen parent values for each depth level
  const lastParentValues = React.useRef<Record<number, string>>({})
  
  if (!typedTable.getRowModel().rows?.length) {
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
      {typedTable.getRowModel().rows.map((row: Row<unknown>) => {
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
              const columnDef = cell.column.columnDef as unknown as { alignment?: 'left' | 'center' | 'right' }
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
                  className={`p-1 py-1.5 align-middle ${alignmentClass} ${isGroupedColumn ? "font-medium" : ""}`}
                >
                  {/* For all cells, check if it's grouped, aggregated, or placeholder */}
                  <span style={{ paddingLeft: cellIndex === 0 ? `${row.depth * 1}rem` : 0 }}>
                    {cell.getIsGrouped() ? (
                      // If the cell is grouped, render the group value with expand/collapse button
                      <>
                        {/* Add expand/collapse button next to grouped cells */}
                        {row.subRows?.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-0.5 h-3 w-3 p-0 flex-shrink-0 inline-flex"
                            onClick={() => row.toggleExpanded()}
                          >
                            {row.getIsExpanded() ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({row.subRows.length})
                        </span>
                      </>
                    ) : cell.getIsAggregated() ? (
                      // If the cell is aggregated, render the aggregation
                      <>
                        {flexRender(
                          cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </>
                    ) : cell.getIsPlaceholder() ? (
                      // If it's a placeholder, render nothing
                      null
                    ) : (
                      // Otherwise render the cell normally
                      flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )
                    )}
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