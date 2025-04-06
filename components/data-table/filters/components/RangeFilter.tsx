"use client"

/**
 * Range Filter Component
 * 
 * A component that provides a numeric range selection interface for filtering table data.
 * It allows users to specify minimum and maximum values to filter table rows within a
 * numeric range.
 * 
 * Features:
 * - Minimum and maximum value inputs
 * - Numeric input validation
 * - Real-time filter updates
 * - Keyboard support (Enter key)
 * - Consistent styling with the design system
 * 
 * @module data-table/filters/components/RangeFilter
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { RangeFilter } from "../../types"

/**
 * Props for the RangeFilterComponent
 * 
 * @template TData The type of data in the table rows
 */
interface RangeFilterProps<TData> {
  /** The column instance from TanStack Table */
  column: Column<TData, unknown>
  /** The filter configuration */
  filter: RangeFilter
}

/**
 * Range Filter Component
 * 
 * Renders input fields for minimum and maximum values to filter table data within a
 * numeric range. The component integrates with TanStack Table's filtering system and
 * provides a user-friendly interface for specifying range boundaries.
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
 * <RangeFilterComponent
 *   column={column}
 *   filter={{
 *     type: 'range'
 *   }}
 * />
 * ```
 */
export function RangeFilterComponent<TData>({
  column,
}: RangeFilterProps<TData>) {
  const filterValue = column.getFilterValue() as [number | undefined, number | undefined]
  const [min, setMin] = React.useState<string>(filterValue?.[0] !== undefined ? String(filterValue[0]) : "")
  const [max, setMax] = React.useState<string>(filterValue?.[1] !== undefined ? String(filterValue[1]) : "")

  // Handle when filter value changes externally
  React.useEffect(() => {
    if (filterValue) {
      setMin(filterValue[0] !== undefined ? String(filterValue[0]) : "")
      setMax(filterValue[1] !== undefined ? String(filterValue[1]) : "")
    } else {
      setMin("")
      setMax("")
    }
  }, [filterValue])

  // Apply range filter when min or max changes
  const handleRangeFilter = React.useCallback(() => {
    const minVal = min ? Number(min) : undefined
    const maxVal = max ? Number(max) : undefined
    
    column.setFilterValue(
      minVal !== undefined || maxVal !== undefined 
        ? [minVal, maxVal] 
        : undefined
    )
  }, [min, max, column])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          className="h-8"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onBlur={handleRangeFilter}
          onKeyDown={(e) => e.key === 'Enter' && handleRangeFilter()}
        />
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Max"
          className="h-8"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onBlur={handleRangeFilter}
          onKeyDown={(e) => e.key === 'Enter' && handleRangeFilter()}
        />
      </div>
    </div>
  )
} 