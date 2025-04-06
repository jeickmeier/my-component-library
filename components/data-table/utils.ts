/**
 * Data Table Utilities Module
 * 
 * This module provides utility functions used across the data table components.
 * These utilities handle common operations like data manipulation, type checking,
 * and data export functionality.
 * 
 * Key Features:
 * - Data manipulation utilities
 * - Type checking and guards
 * - Column accessor management
 * - CSV export functionality
 * 
 * @module data-table-utils
 */

import { DataTableColumnDef, FilterOption } from "./types"

/**
 * Gets unique values from an array
 * 
 * This function creates a new array containing only unique values from the input array.
 * It uses the Set object to efficiently remove duplicates.
 * 
 * @template T - The type of values in the array
 * @param values - The input array containing values (may include duplicates)
 * @returns A new array containing only unique values
 * 
 * @example
 * ```typescript
 * const numbers = [1, 2, 2, 3, 3, 3];
 * const uniqueNumbers = getUniqueValues(numbers); // [1, 2, 3]
 * 
 * const strings = ['a', 'b', 'a', 'c'];
 * const uniqueStrings = getUniqueValues(strings); // ['a', 'b', 'c']
 * ```
 */
export function getUniqueValues<T>(values: T[]): T[] {
  return [...new Set(values)]
}

/**
 * Type guard to check if a column has accessorKey
 * 
 * This function checks if a column definition has a valid accessorKey property.
 * It can be used to narrow down the type of a column definition in TypeScript.
 * 
 * @template TData - The type of data in the table
 * @param column - The column definition to check
 * @returns true if the column has a valid accessorKey property
 * 
 * @example
 * ```typescript
 * const column: DataTableColumnDef<User> = {
 *   accessorKey: 'name',
 *   header: 'Name'
 * };
 * 
 * if (hasAccessorKey(column)) {
 *   // TypeScript now knows column has accessorKey
 *   const key = column.accessorKey; // string
 * }
 * ```
 */
export function hasAccessorKey<TData>(column: DataTableColumnDef<TData>): column is DataTableColumnDef<TData> & { accessorKey: string } {
  return 'accessorKey' in column && typeof column.accessorKey === 'string'
}

/**
 * Helper function to extract unique values from data for a specific column
 * 
 * This function processes table data to extract unique values for a specific column,
 * which can be used to populate filter options. It handles both single values and
 * arrays of values, and converts all values to strings.
 * 
 * @template TData - The type of data in the table
 * @param data - The array of data objects
 * @param columnId - The ID of the column to extract values from
 * @returns An array of FilterOption objects containing unique values
 * 
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: 'John', roles: ['admin', 'user'] },
 *   { id: 2, name: 'Jane', roles: ['user'] },
 *   { id: 3, name: 'Bob', roles: ['admin'] }
 * ];
 * 
 * // Get unique names
 * const nameOptions = getOptionsFromData(users, 'name');
 * // [{ label: 'John', value: 'John' }, { label: 'Jane', value: 'Jane' }, ...]
 * 
 * // Get unique roles
 * const roleOptions = getOptionsFromData(users, 'roles');
 * // [{ label: 'admin', value: 'admin' }, { label: 'user', value: 'user' }]
 * ```
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
 * 
 * This function extracts the ID of a column from its definition.
 * It first checks for an explicit ID, then falls back to the accessorKey
 * if available, and finally returns an empty string if neither exists.
 * 
 * @template TData - The type of data in the table
 * @param column - The column definition
 * @returns The column ID or an empty string if no ID is available
 * 
 * @example
 * ```typescript
 * const column1 = { id: 'name', accessorKey: 'fullName' };
 * const id1 = getColumnId(column1); // 'name'
 * 
 * const column2 = { accessorKey: 'email' };
 * const id2 = getColumnId(column2); // 'email'
 * 
 * const column3 = { header: 'Age' };
 * const id3 = getColumnId(column3); // ''
 * ```
 */
export function getColumnId<TData>(column: DataTableColumnDef<TData>): string {
  return column.id || 
    (hasAccessorKey(column) ? column.accessorKey : '')
}

/**
 * Exports table data to CSV and triggers download
 * 
 * This function converts table data to CSV format and triggers a download
 * in the user's browser. It handles proper escaping of values containing
 * commas, quotes, or newlines.
 * 
 * @template TData - The type of data in the table
 * @param data - The array of data objects to export
 * @param columns - Array of column definitions to determine which fields to export
 * @param filename - Name of the CSV file to download (without extension)
 * 
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, name: 'John Doe', email: 'john@example.com' },
 *   { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
 * ];
 * 
 * const columns = [
 *   { id: 'name', header: 'Full Name' },
 *   { id: 'email', header: 'Email Address' }
 * ];
 * 
 * exportToCSV(users, columns, 'users-export');
 * // Downloads 'users-export.csv' with the data
 * ```
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