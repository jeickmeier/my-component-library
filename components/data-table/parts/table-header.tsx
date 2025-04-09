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
import { flexRender, HeaderGroup, Header, Table } from "@tanstack/react-table"
import { useDataTable } from "../core/context"
import { DataTableColumnDef } from "../types"
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
export const TableHeaderComponent = React.memo(
  function TableHeaderComponentInner() {
    const { table } = useDataTable<unknown>()
    const typedTable = table as Table<unknown>
  
    return (
      <TableHeader>
        {typedTable.getHeaderGroups().map((headerGroup: HeaderGroup<unknown>) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header: Header<unknown, unknown>) => {
              const columnDef = header.column.columnDef as DataTableColumnDef<unknown>
              const alignmentClass = columnDef.alignment ? `text-${columnDef.alignment}` : 'text-left';
              
              return (
                <TableHead 
                  key={header.id} 
                  className={`p-2 align-middle ${alignmentClass}`}
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
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
  },
  // We don't need to provide a custom comparison function since the component 
  // should re-render whenever any of the header-related states change, which is
  // handled through the context
) 