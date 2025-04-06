/**
 * Schema Serialization Module
 * 
 * This module provides functions for serializing and deserializing data table schemas.
 * It enables storing table configurations in databases or other storage systems and
 * restoring them to their runtime form.
 * 
 * Features:
 * - Schema serialization to JSON-compatible format
 * - Schema deserialization with runtime restoration
 * - Cell renderer registry integration
 * - Aggregation function restoration
 * - Type-safe serialization/deserialization
 * 
 * @module data-table/schema/serialization
 */

import { DataTableSchema, SerializableDataTableSchema, DataTableColumnDef, SerializableColumnDef } from "../types"
import { CellRendererRegistry } from "../cell-renderers/core"
import { getGlobalAggregationFunctionRegistry } from "../aggregation"

/**
 * Serializes a runtime schema to a JSON-compatible format
 * 
 * This function converts a runtime schema into a format that can be safely stored
 * in a database or transmitted over a network. It handles complex types like
 * functions and objects by converting them to serializable representations.
 * 
 * @template TData - The type of data in the table
 * @param schema - The runtime schema to serialize
 * @returns A serializable version of the schema
 * 
 * @example
 * ```tsx
 * const runtimeSchema = {
 *   columns: [
 *     {
 *       id: 'name',
 *       header: 'Name',
 *       cellRenderer: { type: 'badge', config: { color: 'blue' } }
 *     }
 *   ]
 * }
 * 
 * const serialized = serializeSchema(runtimeSchema)
 * // Can now be stored in a database
 * ```
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
 * Deserializes a stored schema back to its runtime form
 * 
 * This function converts a serialized schema back into a runtime schema with
 * all functions and complex types restored. It uses registries to restore
 * cell renderers and aggregation functions.
 * 
 * @template TData - The type of data in the table
 * @param serialized - The serialized schema to restore
 * @param registry - The cell renderer registry to use for restoration
 * @returns The restored runtime schema
 * 
 * @example
 * ```tsx
 * const serializedSchema = {
 *   columns: [
 *     {
 *       id: 'name',
 *       header: 'Name',
 *       cellRenderer: { type: 'badge', config: { color: 'blue' } }
 *     }
 *   ]
 * }
 * 
 * const runtimeSchema = deserializeSchema(serializedSchema, cellRendererRegistry)
 * // Can now be used with the data table
 * ```
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