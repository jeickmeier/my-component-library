"use client"

import * as React from "react"
import { DataTableProvider } from "./context"
import { DataTableProps } from "../types"
import { Table } from "@/components/ui/table"
import { TableHeader, TableBody, Toolbar } from "../parts"
import { PaginationControls } from "../pagination"

/**
 * The main DataTable component
 * 
 * This is the entry point for the data table that users will interact with.
 */
export function DataTable<TData>({
  schema,
  data,
}: DataTableProps<TData>) {
  return (
    <DataTableProvider schema={schema} data={data}>
      <DataTableContent />
    </DataTableProvider>
  )
}

/**
 * Internal component that renders the table content
 * 
 * This component consumes the DataTable context.
 */
function DataTableContent() {
  return (
    <div className="space-y-2">
      <Toolbar />
      <div className="rounded-md border">
        <Table>
          <TableHeader />
          <TableBody />
        </Table>
      </div>
      <PaginationControls />
    </div>
  )
} 