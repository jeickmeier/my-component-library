"use client"

/**
 * Pagination Controls Module
 * 
 * This module provides a component for managing table pagination through a user interface.
 * It includes controls for page navigation, page size selection, and displays current
 * pagination state information.
 * 
 * Features:
 * - Page navigation controls
 * - Page size selection
 * - Current page indicator
 * - Total entries count
 * - Grouping information display
 * - Responsive design
 * - Keyboard accessibility
 * 
 * @module data-table/pagination/pagination-controls
 */

import * as React from "react"
import { useDataTable } from "../core/context"
import { Table } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Pagination Controls Component
 * 
 * A component that provides a comprehensive interface for managing table pagination.
 * It displays the current pagination state and provides controls for navigating through
 * pages and adjusting the page size.
 * 
 * Features:
 * - Page navigation (previous/next)
 * - Page size selection (25, 50, 100, 250, 500, 1000)
 * - Current page and total pages display
 * - Total entries count
 * - Grouping information display
 * - Responsive design
 * - Keyboard accessibility
 * 
 * The component automatically hides itself if pagination is disabled in the schema.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <PaginationControls />
 * ```
 */
export function PaginationControls() {
  const {
    schema,
    table,
    grouping,
  } = useDataTable<unknown>()
  
  // Cast table to the correct type
  const typedTable = table as Table<unknown>

  // If pagination is not enabled, don't render anything
  if (schema.enablePagination !== true) {
    return null
  }

  /**
   * Gets the display label for a grouped column
   * 
   * @param columnId The ID of the column to get the label for
   * @returns The display label for the column
   */
  const getGroupedColumnLabel = (columnId: string) => {
    const column = schema.columns.find(c => c.id === columnId) ||
      schema.columns.find(c => 'accessorKey' in c && c.accessorKey === columnId)
    
    return typeof column?.header === 'string'
      ? column.header
      : columnId.charAt(0).toUpperCase() + columnId.slice(1)
  }

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex-1 text-muted-foreground">
        Showing {typedTable.getFilteredRowModel().rows.length} of {typedTable.options.data.length} entries
        {grouping.length > 0 && (
          <span className="ml-2">
            (Grouped by{" "}
            {grouping.map((columnId, index) => {
              return (
                <React.Fragment key={columnId}>
                  <span className="font-medium">
                    {getGroupedColumnLabel(columnId)}
                  </span>
                  {index < grouping.length - 1 ? " → " : ""}
                </React.Fragment>
              )
            })}
            )
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 border rounded-md p-0.5">
        <Select
          value={typedTable.getState().pagination.pageSize.toString()}
          onValueChange={(value) => {
            typedTable.setPageSize(Number(value))
          }}
        >
          <SelectTrigger className="h-6 w-[80px] border-0 text-xs">
            <SelectValue placeholder={typedTable.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent>
            {[25, 50, 100, 250, 500, 1000].map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()} className="text-xs">
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs font-medium px-1">per page</span>
        <div className="border-l h-6 mx-1"></div>
        <button
          className={`h-6 px-1.5 flex items-center ${!typedTable.getCanPreviousPage() ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"} rounded-sm`}
          onClick={() => {
            if (typedTable.getCanPreviousPage()) {
              typedTable.previousPage()
            }
          }}
          disabled={!typedTable.getCanPreviousPage()}
        >
          <span className="sr-only">Previous page</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        <span className="text-xs font-medium">
          Page {typedTable.getState().pagination.pageIndex + 1} of{" "}
          {typedTable.getPageCount()}
        </span>
        <button
          className={`h-6 px-1.5 flex items-center ${!typedTable.getCanNextPage() ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"} rounded-sm`}
          onClick={() => {
            if (typedTable.getCanNextPage()) {
              typedTable.nextPage()
            }
          }}
          disabled={!typedTable.getCanNextPage()}
        >
          <span className="sr-only">Next page</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
      </div>
    </div>
  )
} 