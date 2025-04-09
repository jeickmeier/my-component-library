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
import { CellRendererFunction } from "../cell-renderers"
import { getGlobalAggregationFunctionRegistry } from "../aggregation"
import { Row } from "@tanstack/react-table"

// Define a minimal type for the registry based on usage
interface CellRendererRegistry {
  get: (type: string) => CellRendererFunction | undefined;
}

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
        aggregationRenderer: column.aggregationRenderer
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
        if (renderer && typeof renderer === 'function') {
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
        } else {
          // Fallback cell renderer if the specified type is not found
          column.cell = (props) => {
            return String(props.getValue() ?? '');
          }
        }
      }
      
      // Set aggregation function if aggregationType is specified
      if (col.aggregationType) {
        const aggregationFn = aggregationRegistry.get(col.aggregationType)
        if (aggregationFn) {
          column.aggregationFn = (columnId, leafRows, childRows) => 
            aggregationFn(
              columnId, 
              leafRows as Row<unknown>[], 
              childRows as Row<unknown>[], 
              col.aggregationRenderer?.config
            )
            
          // Handle aggregation renderer if specified
          if (col.aggregationRenderer?.type) {
            const aggRenderer = registry.get(col.aggregationRenderer.type)
            if (!aggRenderer) {
              // If the specified renderer doesn't exist, use a basic fallback
            }
          }
        }
      }
      
      return column
    })
  }
} 