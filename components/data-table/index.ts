/**
 * Data Table Module
 * 
 * This module serves as the main entry point for the data table component system.
 * It provides a comprehensive set of tools for building and managing data tables
 * with advanced features like filtering, sorting, grouping, and pagination.
 * 
 * Key Components:
 * - Core DataTable component
 * - Context and hooks for state management
 * - Schema utilities for table configuration
 * - Filter functionality for data filtering
 * - Column management tools
 * - Grouping capabilities
 * - Pagination controls
 * - Cell rendering system
 * - Aggregation functions
 * 
 * Features:
 * - Type-safe table configuration
 * - Flexible data handling
 * - Customizable column definitions
 * - Advanced filtering options
 * - Multi-level grouping
 * - Responsive pagination
 * - Custom cell rendering
 * - Data aggregation
 * - Backward compatibility support
 * 
 * @module data-table
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

// Export schema utilities
export * from "./schema"

// Export grouping functionality
export * from "./grouping"

// Export UI parts
export * from "./parts"

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

// Re-export for backward compatibility
export { DataTableColumnHeader } from "./parts/column-header"
export { createColumn, createColumns } from "./utils/column-helper"
export { saveSchemaToFile, loadSchemaFromFile } from "./schema/column-serialization" 