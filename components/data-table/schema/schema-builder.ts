/**
 * Schema Builder Module
 * 
 * This module provides a fluent API for building data table schemas programmatically.
 * It offers a type-safe and intuitive way to construct complex table configurations
 * through method chaining.
 * 
 * Features:
 * - Fluent API for schema construction
 * - Type-safe column definitions
 * - Method chaining for intuitive configuration
 * - Comprehensive column customization
 * - Built-in validation and normalization
 * 
 * @module data-table/schema/schema-builder
 */

import { DataTableSchema, DataTableColumnDef, ColumnFilter } from "../types"
import { createDataTableSchema } from "./schema-utils"
import { AggregationFunctionType, AggregationFunctionConfig } from "../aggregation"

/**
 * Schema Builder Class
 * 
 * A fluent API class for building data table schemas. Provides methods for
 * configuring columns, filters, grouping, sorting, and other table features
 * through method chaining.
 * 
 * @template TData - The type of data in the table
 * 
 * @example
 * ```tsx
 * const schema = createTableSchema<User>()
 *   .addColumn({
 *     id: 'name',
 *     header: 'Name',
 *     accessorKey: 'name'
 *   })
 *   .addColumn({
 *     id: 'age',
 *     header: 'Age',
 *     accessorKey: 'age'
 *   })
 *   .enableGrouping(['name'])
 *   .setPagination(true, 25)
 *   .build()
 * ```
 */
export class SchemaBuilder<TData> {
  private schema: Partial<DataTableSchema<TData>> = {
    columns: [],
    defaultSorting: [],
    defaultGrouping: [],
    defaultColumnVisibility: {},
  }

  /**
   * Adds a single column to the schema
   * 
   * @param column - The column definition to add
   * @returns The builder instance for method chaining
   */
  addColumn(column: DataTableColumnDef<TData>): SchemaBuilder<TData> {
    this.schema.columns = [...(this.schema.columns || []), column]
    return this
  }

  /**
   * Adds multiple columns to the schema
   * 
   * @param columns - Array of column definitions to add
   * @returns The builder instance for method chaining
   */
  addColumns(columns: DataTableColumnDef<TData>[]): SchemaBuilder<TData> {
    this.schema.columns = [...(this.schema.columns || []), ...columns]
    return this
  }

  /**
   * Enables grouping for specific columns
   * 
   * @param columnIds - Array of column IDs to enable grouping for
   * @returns The builder instance for method chaining
   */
  enableGrouping(columnIds: string[]): SchemaBuilder<TData> {
    this.schema.enableGrouping = true
    
    // Mark specific columns as groupable
    if (this.schema.columns) {
      this.schema.columns = this.schema.columns.map(column => {
        const id = column.id || column.accessorKey as string
        if (id && columnIds.includes(id)) {
          return { ...column, enableGrouping: true }
        }
        return column
      })
    }
    
    return this
  }

  /**
   * Adds a filter to a specific column
   * 
   * @param columnId - The ID of the column to add the filter to
   * @param filter - The filter configuration
   * @returns The builder instance for method chaining
   */
  addFilter(columnId: string, filter: ColumnFilter): SchemaBuilder<TData> {
    if (this.schema.columns) {
      this.schema.columns = this.schema.columns.map(column => {
        const id = column.id || column.accessorKey as string
        if (id === columnId) {
          return { ...column, filter }
        }
        return column
      })
    }
    
    return this
  }

  /**
   * Sets an aggregation function for a column
   * 
   * @param columnId - The ID of the column to set aggregation for
   * @param aggregationType - The type of aggregation function to use
   * @param aggregationConfig - Optional configuration for the aggregation function
   * @returns The builder instance for method chaining
   */
  setAggregation(
    columnId: string, 
    aggregationType: AggregationFunctionType,
    aggregationConfig?: AggregationFunctionConfig
  ): SchemaBuilder<TData> {
    if (this.schema.columns) {
      this.schema.columns = this.schema.columns.map(column => {
        const id = column.id || column.accessorKey as string
        if (id === columnId) {
          return { 
            ...column, 
            aggregationType,
            ...(aggregationConfig ? { aggregationConfig } : {})
          }
        }
        return column
      })
    }
    
    return this
  }

  /**
   * Sets a cell renderer for a column
   * 
   * @param columnId - The ID of the column to set the renderer for
   * @param rendererType - The type of renderer to use
   * @param config - Optional configuration for the renderer
   * @returns The builder instance for method chaining
   */
  setCellRenderer(
    columnId: string,
    rendererType: string,
    config?: Record<string, unknown>
  ): SchemaBuilder<TData> {
    if (this.schema.columns) {
      this.schema.columns = this.schema.columns.map(column => {
        const id = column.id || column.accessorKey as string
        if (id === columnId) {
          return { 
            ...column, 
            cellRenderer: {
              type: rendererType,
              ...(config ? { config } : {})
            }
          }
        }
        return column
      })
    }
    
    return this
  }

  /**
   * Sets the default sorting state
   * 
   * @param sortingState - Array of sorting configurations
   * @returns The builder instance for method chaining
   */
  setDefaultSorting(sortingState: { id: string, desc: boolean }[]): SchemaBuilder<TData> {
    this.schema.defaultSorting = sortingState
    return this
  }

  /**
   * Sets the default grouping state
   * 
   * @param groupingState - Array of column IDs to group by
   * @returns The builder instance for method chaining
   */
  setDefaultGrouping(groupingState: string[]): SchemaBuilder<TData> {
    this.schema.defaultGrouping = groupingState
    return this
  }

  /**
   * Configures pagination settings
   * 
   * @param enabled - Whether to enable pagination
   * @param defaultPageSize - Optional default page size
   * @returns The builder instance for method chaining
   */
  setPagination(enabled: boolean, defaultPageSize?: number): SchemaBuilder<TData> {
    this.schema.enablePagination = enabled
    if (defaultPageSize) {
      this.schema.defaultPageSize = defaultPageSize
    }
    return this
  }

  /**
   * Sets the default column visibility state
   * 
   * @param visibility - Object mapping column IDs to visibility states
   * @returns The builder instance for method chaining
   */
  setColumnVisibility(visibility: Record<string, boolean>): SchemaBuilder<TData> {
    this.schema.defaultColumnVisibility = visibility
    return this
  }

  /**
   * Enables or disables the global filter
   * 
   * @param enabled - Whether to enable the global filter
   * @returns The builder instance for method chaining
   */
  setGlobalFilter(enabled: boolean): SchemaBuilder<TData> {
    this.schema.enableGlobalFilter = enabled
    return this
  }

  /**
   * Builds and returns the final schema
   * 
   * @returns The completed DataTableSchema
   */
  build(): DataTableSchema<TData> {
    return createDataTableSchema(this.schema)
  }
}

/**
 * Creates a new schema builder instance
 * 
 * @template TData - The type of data in the table
 * @returns A new SchemaBuilder instance
 * 
 * @example
 * ```tsx
 * const builder = createTableSchema<User>()
 * ```
 */
export function createTableSchema<TData>(): SchemaBuilder<TData> {
  return new SchemaBuilder<TData>()
} 