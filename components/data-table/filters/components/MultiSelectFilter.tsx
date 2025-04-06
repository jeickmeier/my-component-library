"use client"

/**
 * Multi-Select Filter Component
 * 
 * A component that provides a multiple-value selection interface for filtering table data.
 * It allows users to select multiple options from a predefined list of values to filter
 * the table rows.
 * 
 * Features:
 * - Multiple-value selection
 * - Checkbox-based selection
 * - Clear all functionality
 * - Selected count display
 * - Scrollable options list
 * - Consistent styling with the design system
 * 
 * @module data-table/filters/components/MultiSelectFilter
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiSelectFilter } from "../../types"

/**
 * Props for the MultiSelectFilterComponent
 * 
 * @template TData The type of data in the table rows
 */
interface MultiSelectFilterProps<TData> {
  /** The column instance from TanStack Table */
  column: Column<TData, unknown>
  /** The filter configuration containing options */
  filter: MultiSelectFilter
}

/**
 * Multi-Select Filter Component
 * 
 * Renders a list of checkboxes for filtering table data based on multiple selected values.
 * The component integrates with TanStack Table's filtering system and provides a
 * user-friendly interface for selecting multiple filter values.
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
 * <MultiSelectFilterComponent
 *   column={column}
 *   filter={{
 *     type: 'multiSelect',
 *     options: [
 *       { value: 'pending', label: 'Pending' },
 *       { value: 'processing', label: 'Processing' },
 *       { value: 'completed', label: 'Completed' }
 *     ]
 *   }}
 * />
 * ```
 */
export function MultiSelectFilterComponent<TData>({
  column,
  filter,
}: MultiSelectFilterProps<TData>) {
  const filterValue = column.getFilterValue() as string[]
  const [selectedValues, setSelectedValues] = React.useState<string[]>(filterValue || [])

  // Handle when filter value changes externally
  React.useEffect(() => {
    setSelectedValues(filterValue || [])
  }, [filterValue])

  // Handle multi-select checkbox toggle
  const handleMultiSelectToggle = React.useCallback((value: string, checked: boolean) => {
    let newValues: string[]
    
    if (checked) {
      newValues = [...selectedValues, value]
    } else {
      newValues = selectedValues.filter(v => v !== value)
    }
    
    setSelectedValues(newValues)
    column.setFilterValue(newValues.length > 0 ? newValues : undefined)
  }, [selectedValues, column])

  return (
    <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">
          {selectedValues.length} selected
        </div>
        {selectedValues.length > 0 && (
          <button
            onClick={() => {
              setSelectedValues([])
              column.setFilterValue(undefined)
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>
      {filter.options?.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox 
            id={`filter-${column.id}-${option.value}`} 
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => 
              handleMultiSelectToggle(option.value, checked === true)
            }
          />
          <label 
            htmlFor={`filter-${column.id}-${option.value}`}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
} 