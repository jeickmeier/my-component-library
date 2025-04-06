/**
 * Schema Builder
 * 
 * This file provides a fluent API for building data table schemas.
 */

import { DataTableSchema, DataTableColumnDef, ColumnFilter } from "../types"
import { createDataTableSchema } from "./schema-utils"
import { AggregationFunctionType, AggregationFunctionConfig } from "../aggregation"

/**
 * Schema Builder for creating data table schemas with a fluent API
 */
export class SchemaBuilder<TData> {
  private schema: Partial<DataTableSchema<TData>> = {
    columns: [],
    defaultSorting: [],
    defaultGrouping: [],
    defaultColumnVisibility: {},
  }

  /**
   * Add a column to the schema
   */
  addColumn(column: DataTableColumnDef<TData>): SchemaBuilder<TData> {
    this.schema.columns = [...(this.schema.columns || []), column]
    return this
  }

  /**
   * Add multiple columns to the schema
   */
  addColumns(columns: DataTableColumnDef<TData>[]): SchemaBuilder<TData> {
    this.schema.columns = [...(this.schema.columns || []), ...columns]
    return this
  }

  /**
   * Enable grouping for specific columns
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
   * Add a filter to a column
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
   * Set an aggregation type for a column
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
   * Set cell renderer for a column
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
   * Set default sorting
   */
  setDefaultSorting(sortingState: { id: string, desc: boolean }[]): SchemaBuilder<TData> {
    this.schema.defaultSorting = sortingState
    return this
  }

  /**
   * Set default grouping
   */
  setDefaultGrouping(groupingState: string[]): SchemaBuilder<TData> {
    this.schema.defaultGrouping = groupingState
    return this
  }

  /**
   * Enable or disable pagination
   */
  setPagination(enabled: boolean, defaultPageSize?: number): SchemaBuilder<TData> {
    this.schema.enablePagination = enabled
    if (defaultPageSize) {
      this.schema.defaultPageSize = defaultPageSize
    }
    return this
  }

  /**
   * Set default column visibility
   */
  setColumnVisibility(visibility: Record<string, boolean>): SchemaBuilder<TData> {
    this.schema.defaultColumnVisibility = visibility
    return this
  }

  /**
   * Enable or disable global filter
   */
  setGlobalFilter(enabled: boolean): SchemaBuilder<TData> {
    this.schema.enableGlobalFilter = enabled
    return this
  }

  /**
   * Build the final schema
   */
  build(): DataTableSchema<TData> {
    return createDataTableSchema(this.schema)
  }
}

/**
 * Create a new schema builder
 */
export function createTableSchema<TData>(): SchemaBuilder<TData> {
  return new SchemaBuilder<TData>()
} 