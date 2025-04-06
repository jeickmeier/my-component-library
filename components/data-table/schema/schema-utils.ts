/**
 * Schema Utilities
 * 
 * This file contains utility functions for working with data table schemas.
 */

import { DataTableSchema } from "../types"
import { hasAccessorKey } from "../utils"

/**
 * Creates a complete DataTable schema
 */
export function createDataTableSchema<TData>(
  options: Partial<DataTableSchema<TData>>
): DataTableSchema<TData> {
  // Explicitly convert enablePagination to boolean
  const paginationEnabled = options.enablePagination !== false
  
  return {
    columns: options.columns || [],
    defaultSorting: options.defaultSorting || [],
    defaultGrouping: options.defaultGrouping || [],
    defaultColumnVisibility: options.defaultColumnVisibility || {},
    enableGrouping: options.enableGrouping !== false,
    enableGlobalFilter: options.enableGlobalFilter !== false,
    enablePagination: paginationEnabled,
    defaultPageSize: options.defaultPageSize || 10,
  }
}

/**
 * Helper function to extract groupable column IDs from schema
 */
export function getGroupableColumns<TData>(schema: DataTableSchema<TData>): string[] {
  return schema.columns
    .filter(column => column.enableGrouping)
    .map(column => column.id || (hasAccessorKey(column) ? column.accessorKey : ''))
    .filter(Boolean)
}

/**
 * Helper function to extract column filters from schema
 */
export function getColumnFilters<TData>(schema: DataTableSchema<TData>): {
  type: 'select' | 'multi-select' | 'range' | 'date-range' | 'boolean'
  column: string
  label: string
  options?: { label: string, value: string }[]
  min?: number | string
  max?: number | string
  getOptionsFromData?: boolean
}[] {
  return schema.columns
    .filter(column => column.filter)
    .map(column => {
      const columnId = column.id || (hasAccessorKey(column) ? column.accessorKey : '')
      const columnLabel = typeof column.header === 'string' ? column.header : columnId
      
      if (column.filter?.type === 'select') {
        return {
          type: 'select' as const,
          column: columnId,
          label: columnLabel,
          options: column.filter.options,
          getOptionsFromData: column.filter.getOptionsFromData !== false && !column.filter.options?.length
        }
      } else if (column.filter?.type === 'multi-select') {
        return {
          type: 'multi-select' as const,
          column: columnId,
          label: columnLabel,
          options: column.filter.options,
          getOptionsFromData: column.filter.getOptionsFromData !== false && !column.filter.options?.length
        }
      } else if (column.filter?.type === 'range') {
        return {
          type: 'range' as const,
          column: columnId,
          label: columnLabel,
          min: column.filter.min,
          max: column.filter.max
        }
      } else if (column.filter?.type === 'date-range') {
        return {
          type: 'date-range' as const,
          column: columnId,
          label: columnLabel,
          min: column.filter.min,
          max: column.filter.max
        }
      } else if (column.filter?.type === 'boolean') {
        return {
          type: 'boolean' as const,
          column: columnId,
          label: columnLabel,
        }
      }
      
      return null
    })
    .filter(Boolean) as Array<{
      type: 'select' | 'multi-select' | 'range' | 'date-range' | 'boolean'
      column: string
      label: string
      options?: { label: string, value: string }[]
      min?: number | string
      max?: number | string
      getOptionsFromData?: boolean
    }>
} 