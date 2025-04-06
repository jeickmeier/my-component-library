"use client"

/**
 * Table Header Module
 * 
 * This module provides the table header component that renders column headers and
 * their associated controls. It handles header rendering, alignment, and integration
 * with the table's sorting and filtering functionality.
 * 
 * Features:
 * - Column header rendering
 * - Custom alignment support
 * - Placeholder handling
 * - Responsive design
 * - Accessibility support
 * 
 * @module data-table/parts/table-header
 */

import * as React from "react"
import { flexRender, HeaderGroup, Header, ColumnDef, Table } from "@tanstack/react-table"
import { useDataTable } from "../core/context"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

/**
 * Table Header Component
 * 
 * Renders the header section of the data table, including column headers and their
 * associated controls. The component supports custom alignment and placeholder handling.
 * 
 * Features:
 * - Column header rendering
 * - Custom alignment support (left, center, right)
 * - Placeholder handling
 * - Responsive design
 * - Accessibility support
 * 
 * The component automatically:
 * - Renders all header groups
 * - Applies column alignment
 * - Handles placeholder headers
 * - Integrates with table context
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TableHeader />
 * 
 * // With custom alignment
 * const columns = [
 *   {
 *     id: 'name',
 *     header: 'Name',
 *     alignment: 'left'
 *   },
 *   {
 *     id: 'value',
 *     header: 'Value',
 *     alignment: 'right'
 *   }
 * ]
 * ```
 */
export function TableHeaderComponent() {
  const { table } = useDataTable<unknown>()

  return (
    <TableHeader>
      {(table as Table<unknown>).getHeaderGroups().map((headerGroup: HeaderGroup<unknown>) => (
        <TableRow key={headerGroup.id} className="h-8">
          {headerGroup.headers.map((header: Header<unknown, unknown>) => {
            // Determine alignment based on the column data type
            let alignmentClass = ''
            
            // Get explicit column alignment if set
            const columnDef = header.column.columnDef as ColumnDef<unknown> & { alignment?: 'left' | 'center' | 'right' }
            if (columnDef.alignment) {
              alignmentClass = `text-${columnDef.alignment}`
            }
            
            return (
              <TableHead 
                key={header.id} 
                className={`p-1 py-1.5 align-middle ${alignmentClass}`}
              >
                {header.isPlaceholder ? null : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
                )}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
    </TableHeader>
  )
} 