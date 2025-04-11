import { Row } from "@tanstack/react-table"

export type AggregationFunction<TData = unknown> = (
  columnId: string,
  leafRows: Row<TData>[],
  childRows?: Row<TData>[]
) => string | number | null

// First value aggregation - returns the first value in the list
export const firstAggregation: AggregationFunction = (columnId, leafRows) => {
  if (!leafRows.length) return null
  
  const firstRow = leafRows[0]
  const value = firstRow.getValue(columnId)
  
  // Ensure the return type is string | number | null
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }
  
  // Convert other types to string if possible
  return value != null ? String(value) : null
} 