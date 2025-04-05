"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getGroupedRowModel,
  getExpandedRowModel,
  ExpandedState,
  GroupingState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react"
import { DataTableColumnHeader } from "@/app/components/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GroupingPanel } from "@/app/components/data-table-grouping-panel"

interface FilterOption {
  label: string
  value: string
}

interface SelectColumnFilter {
  type: 'select'
  column: string
  label: string
  options: FilterOption[]
}

interface RangeColumnFilter {
  type: 'range'
  column: string
  label: string
  min?: number
  max?: number
}

type ColumnFilter = SelectColumnFilter | RangeColumnFilter

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  columnFilters?: ColumnFilter[]
  enableGrouping?: boolean
  groupableColumns?: string[]
}

/**
 * Example of how to define columns with sorting and visibility controls:
 * 
 * const columns: ColumnDef<YourDataType>[] = [
 *   {
 *     id: "name",
 *     accessorKey: "name",
 *     header: "Name",
 *     enableSorting: true,
 *     enableHiding: true,
 *     enableGrouping: true, // Add this to make column groupable
 *   },
 *   // ... more columns
 * ]
 */

export function DataTable<TData, TValue>({
  columns,
  data,
  columnFilters = [],
  enableGrouping = false,
  groupableColumns = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFiltersState, setColumnFiltersState] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [grouping, setGrouping] = React.useState<GroupingState>([])
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [isGroupingDialogOpen, setIsGroupingDialogOpen] = React.useState(false)

  // Create a list of groupable columns with labels
  const groupableColumnObjects = React.useMemo(() => {
    return groupableColumns.map(columnId => {
      const col = columns.find(c => c.id === columnId || ('accessorKey' in c && c.accessorKey === columnId))
      return {
        id: columnId,
        label: typeof col?.header === 'string' 
          ? col.header 
          : (columnId.charAt(0).toUpperCase() + columnId.slice(1)),
      }
    })
  }, [columns, groupableColumns])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFiltersState,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    state: {
      sorting,
      columnFilters: columnFiltersState,
      globalFilter,
      columnVisibility,
      grouping,
      expanded,
    },
    enableGrouping,
    manualGrouping: !enableGrouping,
    debugTable: true,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-64"
          />
          {enableGrouping && groupableColumns.length > 0 && (
            <Dialog open={isGroupingDialogOpen} onOpenChange={setIsGroupingDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                >
                  <Layers className="h-4 w-4" />
                  Group By
                  {grouping.length > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 rounded-sm px-1 font-normal"
                    >
                      {grouping.length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Table Grouping</DialogTitle>
                  <DialogDescription>
                    Group your data by one or more columns to create hierarchical views. Drag to reorder groups.
                  </DialogDescription>
                </DialogHeader>
                <GroupingPanel
                  availableColumns={groupableColumnObjects}
                  grouping={grouping}
                  onGroupingChange={setGrouping}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {columnFilters.map((filter) => (
            <div key={filter.column} className="flex items-center space-x-2">
              <p className="text-sm font-medium">
                {filter.label}:
              </p>
              {filter.type === 'select' && (
                <Select
                  value={table.getColumn(filter.column)?.getFilterValue() as string || "all"}
                  onValueChange={(value) => {
                    table.getColumn(filter.column)?.setFilterValue(value === "all" ? undefined : value)
                  }}
                >
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue placeholder={`All ${filter.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {filter.type === 'range' && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder={`Min ${filter.label}`}
                    className="h-8 w-24"
                    value={(table.getColumn(filter.column)?.getFilterValue() as [number, number])?.[0] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value ? Number(event.target.value) : undefined;
                      const maxValue = (table.getColumn(filter.column)?.getFilterValue() as [number, number])?.[1];
                      
                      table.getColumn(filter.column)?.setFilterValue(
                        value !== undefined || maxValue !== undefined 
                          ? [value, maxValue] 
                          : undefined
                      );
                    }}
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder={`Max ${filter.label}`}
                    className="h-8 w-24"
                    value={(table.getColumn(filter.column)?.getFilterValue() as [number, number])?.[1] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value ? Number(event.target.value) : undefined;
                      const minValue = (table.getColumn(filter.column)?.getFilterValue() as [number, number])?.[0];
                      
                      table.getColumn(filter.column)?.setFilterValue(
                        minValue !== undefined || value !== undefined 
                          ? [minValue, value] 
                          : undefined
                      );
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <DataTableColumnHeader 
                          column={header.column} 
                          title={flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={grouping.includes(cell.column.id) ? "font-medium" : ""}
                    >
                      {grouping.includes(cell.column.id) && row.subRows?.length > 0 ? (
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-1 h-4 w-4 p-0"
                            onClick={() => {
                              row.toggleExpanded()
                            }}
                          >
                            {row.getIsExpanded() ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <span style={{ paddingLeft: `${row.depth * 2}rem` }}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({row.subRows.length})
                          </span>
                        </div>
                      ) : (
                        <span style={{ paddingLeft: `${row.depth * 2}rem` }}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {data.length} entries
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
        <div className="flex items-center gap-2 border rounded-md p-1">
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px] border-0">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm font-medium px-1">per page</span>
          <div className="border-l h-8 mx-1"></div>
          <button
            className={`h-8 px-2 flex items-center ${!table.getCanPreviousPage() ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"} rounded-sm`}
            onClick={() => {
              if (table.getCanPreviousPage()) {
                table.previousPage()
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Previous page</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>
          <span className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            className={`h-8 px-2 flex items-center ${!table.getCanNextPage() ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"} rounded-sm`}
            onClick={() => {
              if (table.getCanNextPage()) {
                table.nextPage()
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Next page</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
