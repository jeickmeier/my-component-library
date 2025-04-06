"use client"

/**
 * Select Filter Component
 * 
 * A component that provides a single-value selection interface for filtering table data.
 * It allows users to select one option from a predefined list of values to filter the
 * table rows.
 * 
 * Features:
 * - Single-value selection
 * - "All" option to clear filter
 * - Customizable options with labels
 * - Consistent styling with the design system
 * 
 * @module data-table/filters/components/SelectFilter
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelectFilter } from "../../types"

/**
 * Props for the SelectFilterComponent
 * 
 * @template TData The type of data in the table rows
 */
interface SelectFilterProps<TData> {
  /** The column instance from TanStack Table */
  column: Column<TData, unknown>
  /** The filter configuration containing options */
  filter: SelectFilter
}

/**
 * Select Filter Component
 * 
 * Renders a select dropdown for filtering table data based on a single selected value.
 * The component integrates with TanStack Table's filtering system and provides a
 * user-friendly interface for selecting filter values.
 * 
 * @template TData The type of data in the table rows
 * 
 * @param props Component properties
 * @param props.column The column instance from TanStack Table
 * @param props.filter The filter configuration containing options
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SelectFilterComponent
 *   column={column}
 *   filter={{
 *     type: 'select',
 *     options: [
 *       { value: 'active', label: 'Active' },
 *       { value: 'inactive', label: 'Inactive' }
 *     ]
 *   }}
 * />
 * ```
 */
export function SelectFilterComponent<TData>({
  column,
  filter,
}: SelectFilterProps<TData>) {
  const filterValue = column.getFilterValue() as string

  return (
    <Select
      value={filterValue || "_all"}
      onValueChange={(value) => {
        column.setFilterValue(value === "_all" ? undefined : value)
      }}
    >
      <SelectTrigger className="h-8 w-full">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_all">All</SelectItem>
        {filter.options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 