/**
 * Schema Serialization
 * 
 * This file contains functions to serialize and deserialize data table schemas.
 */

import { DataTableSchema, SerializableDataTableSchema, DataTableColumnDef, SerializableColumnDef } from "../types"
import { CellRendererRegistry } from "../cell-renderers/core"
import { getGlobalAggregationFunctionRegistry } from "../aggregation"

/**
 * Converts a runtime schema to a serializable schema that can be stored in a database
 */
export function serializeSchema<TData>(schema: DataTableSchema<TData>): SerializableDataTableSchema {
  return {
    ...schema,
    columns: schema.columns.map(column => {
      const serializedColumn: SerializableColumnDef = {
        id: column.id,
        accessorKey: column.accessorKey,
        header: typeof column.header === 'string' ? column.header : undefined,
        enableGrouping: column.enableGrouping,
        enableSorting: column.enableSorting,
        alignment: column.alignment,
        filter: column.filter,
        cellRenderer: column.cellRenderer,
        aggregationType: column.aggregationType,
        aggregationConfig: column.aggregationConfig as Record<string, unknown>
      }
      
      return serializedColumn
    })
  }
}

/**
 * Converts a serializable schema back to a runtime schema
 */
export function deserializeSchema<TData>(
  serialized: SerializableDataTableSchema,
  registry: CellRendererRegistry
): DataTableSchema<TData> {
  // Get aggregation registry
  const aggregationRegistry = getGlobalAggregationFunctionRegistry()
  
  return {
    ...serialized,
    columns: serialized.columns.map(col => {
      const column: DataTableColumnDef<TData> = {
        ...col
      }
      
      // Convert cell renderer type back to function
      if (col.cellRenderer) {
        const renderer = registry.get(col.cellRenderer.type)
        if (renderer) {
          // Pass the cell context to the renderer after casting
          column.cell = (props) => {
            // Cast the props to a compatible format for our renderers
            return renderer({
              getValue: props.getValue,
              row: {
                getValue: (colId: string) => props.row.getValue(colId),
              },
              column: {
                id: props.column.id,
              }
            }, col.cellRenderer?.config as Record<string, unknown>)
          }
        }
      }
      
      // Set aggregation function if aggregationType is specified
      if (col.aggregationType) {
        const aggregationFn = aggregationRegistry.get(col.aggregationType)
        if (aggregationFn) {
          column.aggregationFn = (columnId, leafRows, childRows) => 
            aggregationFn(columnId, leafRows, childRows, col.aggregationConfig)
        }
      }
      
      return column
    })
  }
} 