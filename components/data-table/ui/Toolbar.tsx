import * as React from "react"
import { Table as ReactTable } from "@tanstack/react-table"
import { ColumnFilter } from "@/components/data-table/types"
import { GlobalFilter } from "./filter/GlobalFilter"

// Define props for DataTableFilters
interface DataTableToolbarProps<TData> {
  table: ReactTable<TData>
  columnFilters: ColumnFilter[]
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

// Memoize the filters component to prevent rerendering on aggregation changes
export const DataTableToolbar = React.memo(function DataTableToolbarProps<TData>({
  globalFilter,
  setGlobalFilter,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      {/* Global Filter */}
      <GlobalFilter 
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

    </div>
  )
}); 