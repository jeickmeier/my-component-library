"use client"

/**
 * Filter Factory Module
 * 
 * This module provides a factory component that dynamically creates the appropriate
 * filter interface based on the column's filter configuration. It serves as a bridge
 * between the table's column configuration and the actual filter components.
 * 
 * The factory handles:
 * - Filter type detection
 * - Component selection
 * - Filter state management
 * - Clear filter functionality
 * 
 * @module data-table/filters/filter-factory
 */

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

/**
 * Props for the FilterFactory component
 * 
 * @template TData The type of data in the table rows
 */
interface FilterFactoryProps<TData> {
  /** The column instance from TanStack Table */
  column: Column<TData, unknown>
  /** The filter configuration for the column */
  filter: ColumnFilter
  /** Whether to show the clear filter button */
  showClearButton?: boolean
}

/**
 * Filter Factory Component
 * 
 * A factory component that renders the appropriate filter interface based on
 * the column's filter configuration. It supports various filter types and
 * provides a consistent interface for filter management.
 * 
 * Features:
 * - Dynamic filter component selection
 * - Filter state management
 * - Clear filter functionality
 * - Consistent styling and behavior
 * 
 * Supported Filter Types:
 * - Select (single choice)
 * - Multi-select (multiple choices)
 * - Range (numeric ranges)
 * - Date Range (date ranges)
 * - Boolean (true/false)
 * 
 * @template TData The type of data in the table rows
 * 
 * @param props Component properties
 * @param props.column The column instance from TanStack Table
 * @param props.filter The filter configuration for the column
 * @param props.showClearButton Whether to show the clear filter button
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FilterFactory
 *   column={column}
 *   filter={{
 *     type: 'select',
 *     options: ['Active', 'Inactive']
 *   }}
 * />
 * 
 * // With clear button
 * <FilterFactory
 *   column={column}
 *   filter={{
 *     type: 'dateRange',
 *     format: 'YYYY-MM-DD'
 *   }}
 *   showClearButton={true}
 * />
 * ```
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