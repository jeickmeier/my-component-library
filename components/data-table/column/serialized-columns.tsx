"use client"

import { deserializeSchema } from "../schema/serialization"
import { SerializableDataTableSchema } from "../types"
import { getGlobalCellRendererRegistry } from "../cell-renderers"

/**
 * Function to save schema via API
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
 * Function to load schema via API
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