"use client"

/**
 * Pagination Module
 * 
 * This module provides the pagination component for the data table, which includes
 * page navigation controls, page size selection, and entry count display. The
 * component integrates with the table's context to provide a consistent interface
 * for pagination operations.
 * 
 * Features:
 * - Page navigation controls
 * - Page size selection
 * - Entry count display
 * - Grouping information display
 * - Responsive design
 * - Accessibility support
 * 
 * @module data-table/parts/pagination
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
import { PreviousPageIcon, NextPageIcon } from "./icons"

// Memoized pagination button component to reduce re-renders
interface PaginationButtonProps {
  onClick: () => void;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
}

const PaginationButton = React.memo(({ onClick, disabled, label, icon }: PaginationButtonProps) => (
  <button
    className={`h-6 px-1.5 flex items-center ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"} rounded-sm`}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
  >
    <span className="sr-only">{label}</span>
    {icon}
  </button>
));
PaginationButton.displayName = 'PaginationButton';

/**
 * Pagination Component
 * 
 * A comprehensive pagination component that provides page navigation, size selection,
 * and entry count display for the data table. It integrates with the table's context
 * to manage pagination state and display grouping information when applicable.
 * 
 * Features:
 * - Page navigation with previous/next buttons
 * - Page size selection (25, 50, 100, 250, 500, 1000)
 * - Current page and total pages display
 * - Total entries count
 * - Grouping information display
 * - Responsive design
 * - Accessibility support
 * 
 * The component automatically:
 * - Renders pagination controls when enabled
 * - Shows entry count and grouping information
 * - Provides page size selection
 * - Handles page navigation
 * - Disables navigation buttons when at limits
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Pagination />
 * 
 * // With custom configuration
 * const schema = {
 *   enablePagination: true,
 *   columns: [
 *     {
 *       id: 'name',
 *       header: 'Name',
 *       enableGrouping: true
 *     }
 *   ]
 * }
 * ```
 */
export function Pagination() {
  const {
    schema,
    table,
    grouping,
  } = useDataTable<unknown>()
  
  // Cast table to the correct type
  const typedTable = table as Table<unknown>

  // Memoize callback functions to prevent recreating on each render
  const handlePreviousPage = React.useCallback(() => {
    if (typedTable.getCanPreviousPage()) {
      typedTable.previousPage()
    }
  }, [typedTable]);

  const handleNextPage = React.useCallback(() => {
    if (typedTable.getCanNextPage()) {
      typedTable.nextPage()
    }
  }, [typedTable]);

  const handlePageSizeChange = React.useCallback((value: string) => {
    typedTable.setPageSize(Number(value))
  }, [typedTable]);

  // If pagination is not enabled, don't render anything
  if (schema.enablePagination !== true) {
    return null
  }

  /**
   * Gets the display label for a grouped column
   * 
   * @param columnId - The ID of the column to get the label for
   * @returns The display label for the column
   */
  const getGroupedColumnLabel = (columnId: string) => {
    const column = schema.columns.find(c => c.id === columnId) ||
      schema.columns.find(c => 'accessorKey' in c && c.accessorKey === columnId)
    
    return typeof column?.header === 'string'
      ? column.header
      : columnId.charAt(0).toUpperCase() + columnId.slice(1)
  }

  // Memoize derived state to prevent recalculations
  const filteredRowCount = typedTable.getFilteredRowModel().rows.length;
  const totalRowCount = typedTable.options.data.length;
  const currentPage = typedTable.getState().pagination.pageIndex + 1;
  const totalPages = typedTable.getPageCount();
  const canPreviousPage = typedTable.getCanPreviousPage();
  const canNextPage = typedTable.getCanNextPage();
  const pageSize = typedTable.getState().pagination.pageSize.toString();

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex-1 text-muted-foreground">
        Showing {filteredRowCount} of {totalRowCount} entries
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
          value={pageSize}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="h-6 w-[80px] border-0 text-xs">
            <SelectValue placeholder={pageSize} />
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
        
        <PaginationButton
          onClick={handlePreviousPage}
          disabled={!canPreviousPage}
          label="Previous page"
          icon={<PreviousPageIcon />}
        />
        
        <span className="text-xs font-medium">
          Page {currentPage} of{" "}
          {totalPages}
        </span>
        
        <PaginationButton
          onClick={handleNextPage}
          disabled={!canNextPage}
          label="Next page"
          icon={<NextPageIcon />}
        />
      </div>
    </div>
  )
} 