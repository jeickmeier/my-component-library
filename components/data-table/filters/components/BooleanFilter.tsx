"use client"

/**
 * Boolean Filter Component
 * 
 * A component that provides a boolean selection interface for filtering table data.
 * It allows users to filter table rows based on true/false values using a radio group
 * with visual indicators.
 * 
 * Features:
 * - Radio group selection
 * - Visual indicators (check/x icons)
 * - All/Yes/No options
 * - Real-time filter updates
 * - Consistent styling with the design system
 * 
 * @module data-table/filters/components/BooleanFilter
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, X } from "lucide-react"
import { BooleanFilter } from "../../types"

/**
 * Props for the BooleanFilterComponent
 * 
 * @template TData The type of data in the table rows
 */
interface BooleanFilterProps<TData> {
  /** The column instance from TanStack Table */
  column: Column<TData, unknown>
  /** The filter configuration */
  filter: BooleanFilter
}

/**
 * Boolean Filter Component
 * 
 * Renders a radio group for filtering table data based on boolean values. The component
 * integrates with TanStack Table's filtering system and provides a user-friendly
 * interface for selecting boolean filter values with visual indicators.
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
 * <BooleanFilterComponent
 *   column={column}
 *   filter={{
 *     type: 'boolean'
 *   }}
 * />
 * ```
 */
export function BooleanFilterComponent<TData>({
  column,
}: BooleanFilterProps<TData>) {
  const filterValue = column.getFilterValue() as boolean | undefined
  
  // Convert boolean to string for RadioGroup
  const [booleanValue, setBooleanValue] = React.useState<string>(
    filterValue === undefined ? "all" : filterValue ? "true" : "false"
  )

  // Handle when filter value changes externally
  React.useEffect(() => {
    if (filterValue === undefined) {
      setBooleanValue("all")
    } else {
      setBooleanValue(filterValue ? "true" : "false")
    }
  }, [filterValue])

  // Apply boolean filter when selection changes
  const handleBooleanFilter = React.useCallback((value: string) => {
    setBooleanValue(value)
    
    if (value === "all") {
      column.setFilterValue(undefined)
    } else {
      column.setFilterValue(value === "true")
    }
  }, [column])

  return (
    <RadioGroup 
      value={booleanValue}
      onValueChange={handleBooleanFilter}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all" id={`filter-${column.id}-all`} />
        <Label htmlFor={`filter-${column.id}-all`}>All</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="true" id={`filter-${column.id}-true`} />
        <Label htmlFor={`filter-${column.id}-true`} className="flex items-center">
          <Check className="mr-1 h-4 w-4 text-green-600" />
          Yes
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="false" id={`filter-${column.id}-false`} />
        <Label htmlFor={`filter-${column.id}-false`} className="flex items-center">
          <X className="mr-1 h-4 w-4 text-red-600" />
          No
        </Label>
      </div>
    </RadioGroup>
  )
} 