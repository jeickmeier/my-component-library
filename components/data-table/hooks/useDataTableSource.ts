"use client"

import { useState, useEffect } from 'react'
import { DataTableSchema, deserializeSchema, SerializableDataTableSchema } from '../index'
import { defaultCellRendererRegistry } from '../cell-renderers/defaultRegistry'
import { CellRendererFunction } from '../cell-renderers/types'

// Define the registry interface, mirroring the one expected by deserializeSchema
interface CellRendererRegistryLike {
  get: (type: string) => CellRendererFunction | undefined;
}

// Define the hook's return type
interface UseDataTableSourceReturn<T> {
  schema: DataTableSchema<T> | null
  data: T[]
  loading: boolean
  error: string | null
}

// Internal fetch function for schema
async function fetchSchemaInternal<T>(
  schemaName: string,
  registry: CellRendererRegistryLike
): Promise<DataTableSchema<T>> {
  const response = await fetch(`/api/schemas/${schemaName}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${schemaName}`)
  }
  const serialized = await response.json() as SerializableDataTableSchema
  // Explicitly pass the generic type T to deserializeSchema
  return deserializeSchema<T>(serialized, registry)
}

// Internal fetch function for data
async function fetchDataInternal<T>(dataUrl: string): Promise<T[]> {
  const response = await fetch(dataUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${dataUrl}`)
  }
  return response.json()
}

/**
 * Custom hook to fetch and manage DataTable schema and data.
 * @param schemaName - The name of the schema to fetch (used in /api/schemas/:schemaName).
 * @param dataUrl - The URL to fetch the table data from.
 * @param registry - The cell renderer registry to use for deserialization. Defaults to defaultCellRendererRegistry.
 * @returns An object containing the schema, data, loading state, and error state.
 */
export function useDataTableSource<T = unknown>(
  schemaName: string,
  dataUrl: string,
  registry: CellRendererRegistryLike = defaultCellRendererRegistry
): UseDataTableSourceReturn<T> {
  const [schema, setSchema] = useState<DataTableSchema<T> | null>(null)
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true // Flag to prevent state updates on unmounted component

    async function loadAllData() {
      setLoading(true)
      setError(null)
      try {
        // Fetch schema and data in parallel
        const [loadedSchema, loadedData] = await Promise.all([
          fetchSchemaInternal<T>(schemaName, registry),
          fetchDataInternal<T>(dataUrl)
        ])

        if (isMounted) {
          setSchema(loadedSchema)
          setData(loadedData)
        }
      } catch (err) {
        console.error('Error loading data table source:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred while loading data.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAllData()

    // Cleanup function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false
    }
    // Dependency array includes schemaName, dataUrl, and registry instance
  }, [schemaName, dataUrl, registry])

  return { schema, data, loading, error }
} 