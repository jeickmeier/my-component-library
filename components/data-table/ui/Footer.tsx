import * as React from "react"
import { Table as ReactTable, GroupingState } from "@tanstack/react-table"

// Define props for DataTableFooter
interface DataTableFooterProps<TData> {
  table: ReactTable<TData>
  dataLength: number
  grouping: GroupingState
  groupableColumnObjects: { id: string; label: string }[]
}

// Memoize the footer component to prevent rerendering on aggregation changes
export const DataTableFooter = React.memo(function DataTableFooter<TData>({
  table,
  dataLength,
  grouping,
  groupableColumnObjects,
}: DataTableFooterProps<TData>) {
  return (
    <div className="flex items-center">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {table.getFilteredRowModel().rows.length} of {dataLength} entries
        {grouping.length > 0 && (
          <span className="ml-2">
            (Grouped by{" "}
            {grouping.map((columnId, index) => {
              const column = groupableColumnObjects.find(c => c.id === columnId)
              return (
                <React.Fragment key={columnId}>
                  <span className="font-medium">
                    {column?.label || columnId}
                  </span>
                  {index < grouping.length - 1 ? " → " : ""}
                </React.Fragment>
              )
            })}
            )
          </span>
        )}
      </div>
    </div>
  )
}); 