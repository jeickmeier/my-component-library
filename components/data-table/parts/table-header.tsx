"use client"

import * as React from "react"
import { flexRender, HeaderGroup, Header, ColumnDef, Table } from "@tanstack/react-table"
import { useDataTable } from "../core/context"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

/**
 * TableHeader component for the data table
 * 
 * Renders the header rows with column headers.
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