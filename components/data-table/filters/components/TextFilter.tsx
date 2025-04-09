"use client"

/**
 * Text Filter Component
 * 
 * A component that provides a text input filter for filtering table data.
 * It uses debouncing to prevent excessive re-renders while the user is typing.
 * 
 * Features:
 * - Text input for filtering
 * - Debounced input handling for better performance
 * - Case-insensitive filtering
 * - Immediate filtering on Enter key
 * - Consistent styling with the design system
 * 
 * @module data-table/filters/components/TextFilter
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { TextFilter } from "../../types"

/**
 * Props for the TextFilterComponent
 * 
 * @template TData The type of data in the table rows
 */
interface TextFilterProps<TData> {
  /** The column instance from TanStack Table */
  column: Column<TData, unknown>
  /** The filter configuration */
  filter: TextFilter
}

/**
 * Text Filter Component
 * 
 * Renders a text input field for filtering table data based on text content.
 * The component integrates with TanStack Table's filtering system and provides
 * a user-friendly interface with debounced input for better performance.
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
 * <TextFilterComponent
 *   column={column}
 *   filter={{
 *     type: 'text',
 *     placeholder: 'Search...'
 *   }}
 * />
 * ```
 */
export function TextFilterComponent<TData>({
  column,
  filter,
}: TextFilterProps<TData>) {
  const filterValue = column.getFilterValue() as string
  const [value, setValue] = React.useState<string>(filterValue || "")
  
  // Store timeout ID for debouncing
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Handle when filter value changes externally
  React.useEffect(() => {
    setValue(filterValue || "")
  }, [filterValue])
  
  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Handle input change with debouncing
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout for the filter update
    timeoutRef.current = setTimeout(() => {
      column.setFilterValue(newValue || undefined)
    }, filter.debounceMs || 300)
  }, [column, filter.debounceMs])

  // Apply filter immediately on Enter key
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Apply filter immediately
      column.setFilterValue(value || undefined)
    }
  }, [column, value])

  // Return the input directly - no unnecessary wrapper div
  return (
    <Input
      type="text"
      placeholder={filter.placeholder || "Search..."}
      className="h-8"
      value={value}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
    />
  )
} 