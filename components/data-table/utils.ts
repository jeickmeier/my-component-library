/**
 * Data Table Utilities
 * 
 * This file contains utility functions used across the data table components.
 */

import { DataTableColumnDef, FilterOption } from "./types"

/**
 * Gets unique values from an array
 */
export function getUniqueValues<T>(values: T[]): T[] {
  return [...new Set(values)]
}

/**
 * Type guard to check if a column has accessorKey
 */
export function hasAccessorKey<TData>(column: DataTableColumnDef<TData>): column is DataTableColumnDef<TData> & { accessorKey: string } {
  return 'accessorKey' in column && typeof column.accessorKey === 'string'
}

/**
 * Helper function to extract unique values from data for a specific column
 */
export function getOptionsFromData<TData>(
  data: TData[], 
  columnId: string
): FilterOption[] {
  // Collect all values first, handling both single values and arrays
  const allValues: string[] = []
  
  data.forEach(item => {
    const value = (item as Record<string, unknown>)[columnId]
    
    if (value === undefined || value === null) {
      return // Skip undefined or null values
    }
    
    if (Array.isArray(value)) {
      // If the value is an array, add each item individually
      value.forEach(v => {
        if (v !== undefined && v !== null) {
          allValues.push(String(v))
        }
      })
    } else {
      // Otherwise add as a single value
      allValues.push(String(value))
    }
  })
  
  // Get unique values
  const uniqueValues = getUniqueValues(allValues)
  
  // Convert to FilterOption format
  return uniqueValues.map(value => ({
    label: value,
    value: value
  }))
}

/**
 * Get column ID from a column definition
 */
export function getColumnId<TData>(column: DataTableColumnDef<TData>): string {
  return column.id || 
    (hasAccessorKey(column) ? column.accessorKey : '')
}

/**
 * Exports table data to CSV and triggers download
 * 
 * @param data The data array to export
 * @param columns Array of column definitions to determine which fields to export
 * @param filename Name of the CSV file to download (without extension)
 */
export function exportToCSV<TData>(
  data: TData[],
  columns: DataTableColumnDef<TData>[],
  filename: string = 'table-export'
): void {
  if (!data.length) {
    console.warn('No data to export')
    return
  }

  // Get column headers and accessors
  const columnHeaders: string[] = []
  const columnAccessors: string[] = []

  columns.forEach(column => {
    if (!column.id && !hasAccessorKey(column)) return

    // Get column header
    const header = typeof column.header === 'string' 
      ? column.header 
      : getColumnId(column)
    
    // Get column accessor
    const accessor = getColumnId(column)
    
    columnHeaders.push(header)
    columnAccessors.push(accessor)
  })

  // Create CSV content
  let csvContent = columnHeaders.join(',') + '\n'

  // Add data rows
  data.forEach(row => {
    const rowData = columnAccessors.map(accessor => {
      const value = (row as Record<string, unknown>)[accessor]
      
      if (value === null || value === undefined) {
        return ''
      }
      
      // Convert to string and escape if it contains commas, quotes, or newlines
      const stringValue = String(value)
      const needsQuotes = /[,"\n\r]/.test(stringValue)
      
      return needsQuotes 
        ? `"${stringValue.replace(/"/g, '""')}"` // Escape quotes by doubling them
        : stringValue
    })
    
    csvContent += rowData.join(',') + '\n'
  })

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
} 