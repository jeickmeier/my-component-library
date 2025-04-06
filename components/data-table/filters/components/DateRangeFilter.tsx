"use client"

/**
 * Date Range Filter Component
 * 
 * A component that provides a date range selection interface for filtering table data.
 * It allows users to select start and end dates to filter table rows within a specific
 * date range.
 * 
 * Features:
 * - Calendar-based date selection
 * - Start and end date inputs
 * - Date formatting
 * - Real-time filter updates
 * - Consistent styling with the design system
 * 
 * @module data-table/filters/components/DateRangeFilter
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRangeFilter } from "../../types"

/**
 * Props for the DateRangeFilterComponent
 * 
 * @template TData The type of data in the table rows
 */
interface DateRangeFilterProps<TData> {
  /** The column instance from TanStack Table */
  column: Column<TData, unknown>
  /** The filter configuration */
  filter: DateRangeFilter
}

/**
 * Date Range Filter Component
 * 
 * Renders calendar popovers for selecting start and end dates to filter table data
 * within a date range. The component integrates with TanStack Table's filtering system
 * and provides a user-friendly interface for selecting date ranges.
 * 
 * @template TData The type of data in the table rows
 * 
 * @param props Component properties
 * @param props.column The column instance from TanStack Table
 * @param props.filter The filter configuration
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <DateRangeFilterComponent
 *   column={column}
 *   filter={{
 *     type: 'dateRange',
 *     format: 'yyyy-MM-dd'
 *   }}
 * />
 * ```
 */
export function DateRangeFilterComponent<TData>({
  column,
}: DateRangeFilterProps<TData>) {
  const filterValue = column.getFilterValue() as [string | undefined, string | undefined]
  
  const [fromDate, setFromDate] = React.useState<Date | undefined>(
    filterValue?.[0] ? new Date(filterValue[0]) : undefined
  )
  
  const [toDate, setToDate] = React.useState<Date | undefined>(
    filterValue?.[1] ? new Date(filterValue[1]) : undefined
  )

  // Handle when filter value changes externally
  React.useEffect(() => {
    if (filterValue) {
      setFromDate(filterValue[0] ? new Date(filterValue[0]) : undefined)
      setToDate(filterValue[1] ? new Date(filterValue[1]) : undefined)
    } else {
      setFromDate(undefined)
      setToDate(undefined)
    }
  }, [filterValue])

  // Apply date range filter when dates change
  const handleDateRangeFilter = React.useCallback(() => {
    // Convert dates to ISO strings for filtering
    const fromStr = fromDate?.toISOString()
    const toStr = toDate?.toISOString()
    
    column.setFilterValue(
      fromStr || toStr 
        ? [fromStr, toStr] 
        : undefined
    )
  }, [fromDate, toDate, column])

  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1">
        <div className="text-xs text-muted-foreground mb-1">From date</div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-8",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={(date) => {
                setFromDate(date)
                if (date || toDate) handleDateRangeFilter()
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-col space-y-1">
        <div className="text-xs text-muted-foreground mb-1">To date</div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-8",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={(date) => {
                setToDate(date)
                if (date || fromDate) handleDateRangeFilter()
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 