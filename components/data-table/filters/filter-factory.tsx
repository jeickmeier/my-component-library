"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { X } from "lucide-react"
import { ColumnFilter, isSelectFilter, isMultiSelectFilter, isRangeFilter, isDateRangeFilter, isBooleanFilter } from "../types"
import {
  SelectFilterComponent,
  MultiSelectFilterComponent,
  RangeFilterComponent,
  DateRangeFilterComponent,
  BooleanFilterComponent
} from "./components"

interface FilterFactoryProps<TData> {
  column: Column<TData, unknown>
  filter: ColumnFilter
  showClearButton?: boolean
}

/**
 * Factory component that renders the appropriate filter component based on filter type
 */
export function FilterFactory<TData>({
  column,
  filter,
  showClearButton = false
}: FilterFactoryProps<TData>) {
  // Check if there's an active filter
  const hasActiveFilter = column.getFilterValue() !== undefined

  // Handle clearing the filter
  const handleClearFilter = React.useCallback(() => {
    column.setFilterValue(undefined)
  }, [column])

  // Create the appropriate filter component based on filter type
  const renderFilterComponent = () => {
    if (isSelectFilter(filter)) {
      return <SelectFilterComponent column={column} filter={filter} />
    }
    
    if (isMultiSelectFilter(filter)) {
      return <MultiSelectFilterComponent column={column} filter={filter} />
    }
    
    if (isRangeFilter(filter)) {
      return <RangeFilterComponent column={column} filter={filter} />
    }
    
    if (isDateRangeFilter(filter)) {
      return <DateRangeFilterComponent column={column} filter={filter} />
    }
    
    if (isBooleanFilter(filter)) {
      return <BooleanFilterComponent column={column} filter={filter} />
    }
    
    return null
  }

  return (
    <>
      {renderFilterComponent()}
      
      {hasActiveFilter && showClearButton && (
        <button
          onClick={handleClearFilter}
          className="mt-2 w-full h-7 text-xs flex items-center justify-center rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <X className="mr-1 h-3 w-3" />
          Clear Filter
        </button>
      )}
    </>
  )
} 