/**
 * Column Schema Serialization Module
 * 
 * This module provides functionality for persisting and loading table column schemas.
 * It enables saving and loading column configurations, including customizations
 * like sorting, filtering, and aggregation settings.
 * 
 * @module serialized-columns
 */

"use client"

import { deserializeSchema } from "../schema/serialization"
import { SerializableDataTableSchema } from "../types"
import { getGlobalCellRendererRegistry } from "../cell-renderers"

/**
 * Saves a table schema to a file via API.
 * This function serializes the current table configuration and persists it
 * for later use, allowing users to save their customizations.
 * 
 * Features:
 * - Schema validation before saving
 * - Error handling with detailed messages
 * - Success confirmation with file path
 * - JSON serialization of complex objects
 * 
 * @param schemaName Unique identifier for the schema
 * @param schema The table schema configuration to save
 * 
 * @returns Promise resolving to success status and saved file path
 * 
 * @example
 * ```tsx
 * try {
 *   const result = await saveSchemaToFile('users-table', {
 *     columns: [...],
 *     sorting: [...],
 *     filters: [...]
 *   });
 *   console.log('Schema saved to:', result.path);
 * } catch (error) {
 *   console.error('Failed to save schema:', error);
 * }
 * ```
 * 
 * @throws Error if schema saving fails
 */
export async function saveSchemaToFile(schemaName: string, schema: SerializableDataTableSchema) {
  try {
    const response = await fetch('/api/schemas/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schemaName, schema }),
    })

    if (!response.ok) {
      throw new Error('Failed to save schema')
    }

    const result = await response.json()
    return { success: true, path: result.path }
  } catch (error) {
    console.error('Error saving schema:', error)
    throw error
  }
}

/**
 * Loads a table schema from a file via API.
 * This function retrieves and deserializes a previously saved table configuration,
 * restoring all column settings and customizations.
 * 
 * Features:
 * - Type-safe schema deserialization
 * - Cell renderer registry integration
 * - Error handling with context
 * - Automatic schema validation
 * 
 * @template TData The type of data in the table rows
 * @param schemaName The identifier of the schema to load
 * 
 * @returns Promise resolving to the deserialized table schema
 * 
 * @example
 * ```tsx
 * try {
 *   const schema = await loadSchemaFromFile<User>('users-table');
 *   setTableSchema(schema);
 * } catch (error) {
 *   console.error('Failed to load schema:', error);
 * }
 * ```
 * 
 * @throws Error if schema loading or deserialization fails
 */
export async function loadSchemaFromFile<TData>(schemaName: string) {
  try {
    const response = await fetch(`/api/schemas/load?name=${encodeURIComponent(schemaName)}`)
    
    if (!response.ok) {
      throw new Error('Failed to load schema')
    }

    const serialized = await response.json()
    const registry = getGlobalCellRendererRegistry()
    return deserializeSchema<TData>(serialized, registry)
  } catch (error) {
    console.error(`Error loading schema ${schemaName}:`, error)
    throw new Error(`Failed to load schema: ${schemaName}`)
  }
} 