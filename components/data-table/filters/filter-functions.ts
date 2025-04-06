/**
 * Filter Functions Module
 * 
 * This module provides the core filtering logic for the data table system.
 * It implements various filter functions that can be used with TanStack Table
 * to filter data based on different criteria and data types.
 * 
 * Each filter function is designed to handle specific data types and filtering
 * requirements, providing type-safe and efficient filtering capabilities.
 * 
 * @module data-table/filters/filter-functions
 */

import { FilterFn } from "@tanstack/react-table"

/**
 * Creates a filter function for multi-select filtering
 * 
 * This function creates a filter that allows selecting multiple values from
 * a predefined set of options. It handles various data types and formats:
 * - Array values (checks if any array element matches)
 * - String values (direct comparison)
 * - Other types (converts to string for comparison)
 * 
 * @template TData The type of data in the table rows
 * @returns A filter function that can be used with TanStack Table
 * 
 * @example
 * ```ts
 * // Create a multi-select filter
 * const multiSelectFilter = createMultiSelectFilterFn<User>();
 * 
 * // Use with TanStack Table
 * const table = useReactTable({
 *   columns,
 *   data,
 *   filterFns: {
 *     multiSelect: multiSelectFilter
 *   }
 * });
 * 
 * // Filter values can be an array of any type
 * table.getColumn('status').setFilterValue(['active', 'pending']);
 * ```
 */
export function createMultiSelectFilterFn<TData>(): FilterFn<TData> {
  return (row, columnId, filterValues) => {
    // Handle empty filter values
    if (!filterValues || !Array.isArray(filterValues) || !filterValues.length) return true
    
    // Get the cell value
    const value = row.getValue(columnId)
    
    // Handle different value types
    if (Array.isArray(value)) {
      // If cell value is an array, check if any of the filter values are in the cell value array
      return value.some(v => filterValues.includes(v))
    } else if (typeof value === 'string') {
      // If cell value is a string, check if it's included in the filter values
      return filterValues.includes(value)
    } else {
      // For other types, convert to string and check
      return filterValues.includes(String(value))
    }
  }
}

/**
 * Creates a filter function for date range filtering
 * 
 * This function creates a filter that allows selecting a range of dates.
 * It handles date strings and timestamps, comparing them to ensure they
 * fall within the specified range.
 * 
 * Features:
 * - Handles partial ranges (min only, max only, or both)
 * - Converts various date formats to timestamps
 * - Properly handles edge cases and invalid dates
 * 
 * @template TData The type of data in the table rows
 * @returns A filter function that can be used with TanStack Table
 * 
 * @example
 * ```ts
 * // Create a date range filter
 * const dateRangeFilter = createDateRangeFilterFn<Order>();
 * 
 * // Use with TanStack Table
 * const table = useReactTable({
 *   columns,
 *   data,
 *   filterFns: {
 *     dateRange: dateRangeFilter
 *   }
 * });
 * 
 * // Filter values should be an array with min and max dates
 * table.getColumn('orderDate').setFilterValue(['2023-01-01', '2023-12-31']);
 * ```
 */
export function createDateRangeFilterFn<TData>(): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    // Handle empty filter values
    if (!filterValue || !Array.isArray(filterValue)) return true
    
    // Get the date value and convert to timestamp
    const value = row.getValue(columnId) as string
    if (!value) return false
    
    const dateValue = new Date(value).getTime()
    const [min, max] = filterValue as [string | undefined, string | undefined]
    
    // Check min value if provided
    if (min) {
      const minDate = new Date(min).getTime()
      if (dateValue < minDate) return false
    }
    
    // Check max value if provided
    if (max) {
      const maxDate = new Date(max).getTime()
      if (dateValue > maxDate) return false
    }
    
    return true
  }
}

/**
 * Creates a filter function for boolean filtering
 * 
 * This function creates a filter that handles boolean values, allowing
 * filtering for true/false values in a column. It's particularly useful
 * for columns containing status flags or binary choices.
 * 
 * Features:
 * - Simple true/false comparison
 * - Handles undefined/null filter values
 * - Type-safe boolean comparison
 * 
 * @template TData The type of data in the table rows
 * @returns A filter function that can be used with TanStack Table
 * 
 * @example
 * ```ts
 * // Create a boolean filter
 * const booleanFilter = createBooleanFilterFn<User>();
 * 
 * // Use with TanStack Table
 * const table = useReactTable({
 *   columns,
 *   data,
 *   filterFns: {
 *     boolean: booleanFilter
 *   }
 * });
 * 
 * // Filter values should be true or false
 * table.getColumn('isActive').setFilterValue(true);
 * ```
 */
export function createBooleanFilterFn<TData>(): FilterFn<TData> {
  return (row, columnId, filterValue) => {
    // If no filter value is set, include all rows
    if (filterValue === undefined || filterValue === null) return true
    
    // Get the boolean value from the row
    const value = row.getValue(columnId) as boolean
    
    // Compare with the filter value
    return value === filterValue
  }
} 