/**
 * Data Table
 * 
 * This is the main entry point for the data table component.
 * This file handles re-exports to maintain backward compatibility.
 */

// Export the main DataTable component
export { DataTable } from "./core"

// Export context and hooks
export { useDataTable } from "./core"

// Export types
export * from "./types"

// Export utils
export * from "./utils"

// Export filter functionality
export * from "./filters"

// Export column functionality
export * from "./column"

// Export schema utilities
export * from "./schema"

// Export grouping functionality
export * from "./grouping"

// Export pagination functionality
export * from "./pagination"

// Export cell functionality
export * from "./cell"

// Export aggregation functionality
export * from "./aggregation"

// BACKWARD COMPATIBILITY EXPORTS
// These exports maintain compatibility with existing code
export { DataTable as default } from "./core"

// Re-export from schema for backward compatibility
export { 
  createDataTableSchema,
  getGroupableColumns,
  getColumnFilters,
  serializeSchema,
  deserializeSchema
} from "./schema"
export type { 
  DataTableSchema,
  DataTableColumnDef,
  SerializableDataTableSchema,
  SerializableColumnDef
} from "./types"

// Re-export from column for backward compatibility
export { DataTableColumnHeader } from "./column" 