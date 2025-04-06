/**
 * Filter Functions
 * 
 * This file contains custom filter functions used by the data table.
 */

import { FilterFn } from "@tanstack/react-table"

/**
 * Creates a filter function for multi-select filtering
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