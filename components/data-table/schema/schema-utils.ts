/**
 * Schema Utilities Module
 * 
 * This module provides utility functions for working with data table schemas.
 * It includes functions for schema creation, column filtering, and grouping
 * configuration.
 * 
 * Features:
 * - Schema creation and normalization
 * - Column filtering configuration
 * - Grouping column extraction
 * - Type-safe schema manipulation
 * 
 * @module data-table/schema/schema-utils
 */

import { DataTableSchema } from "../types"
import { hasAccessorKey } from "../utils"

/**
 * Creates a complete DataTable schema from partial options
 * 
 * This function normalizes and completes a partial schema configuration,
 * providing default values for optional properties and ensuring type safety.
 * 
 * @template TData - The type of data in the table
 * @param options - Partial schema configuration
 * @returns Complete DataTableSchema with defaults applied
 * 
 * @example
 * ```tsx
 * const schema = createDataTableSchema({
 *   columns: [
 *     { id: 'name', header: 'Name' },
 *     { id: 'age', header: 'Age' }
 *   ],
 *   enablePagination: true,
 *   defaultPageSize: 25
 * })
 * ```
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
 * Extracts groupable column IDs from a schema
 * 
 * This function identifies columns that are enabled for grouping and returns
 * their IDs. It handles both direct ID references and accessorKey-based columns.
 * 
 * @template TData - The type of data in the table
 * @param schema - The DataTable schema
 * @returns Array of groupable column IDs
 * 
 * @example
 * ```tsx
 * const groupableColumns = getGroupableColumns(schema)
 * // Returns: ['category', 'status']
 * ```
 */
export function getGroupableColumns<TData>(schema: DataTableSchema<TData>): string[] {
  return schema.columns
    .filter(column => column.enableGrouping)
    .map(column => column.id || (hasAccessorKey(column) ? column.accessorKey : ''))
    .filter(Boolean)
}

/**
 * Extracts column filter configurations from a schema
 * 
 * This function processes the schema to identify columns with filter configurations
 * and returns a normalized array of filter settings. It supports multiple filter
 * types and handles various configuration options.
 * 
 * @template TData - The type of data in the table
 * @param schema - The DataTable schema
 * @returns Array of column filter configurations
 * 
 * @example
 * ```tsx
 * const filters = getColumnFilters(schema)
 * // Returns: [
 * //   {
 * //     type: 'select',
 * //     column: 'status',
 * //     label: 'Status',
 * //     options: [
 * //       { label: 'Active', value: 'active' },
 * //       { label: 'Inactive', value: 'inactive' }
 * //     ]
 * //   }
 * // ]
 * ```
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