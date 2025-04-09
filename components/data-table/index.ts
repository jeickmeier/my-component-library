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
 * - Virtualization for large datasets
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
 * - Virtualized rendering for performance
 * 
 * @module data-table
 */

// Export the main DataTable component
export * from "./core"

// Export context and hooks
export * from "./core"

// Export types
export * from "./types"

// Export utils
export * from "./utils"

// Export filter functionality
export * from "./filters"

// Export schema utilities
export * from "./schema"

// Export UI parts
export * from "./parts"

// Export aggregation functionality
export * from "./aggregation"

// Export cell renderers
export * from "./cell-renderers"

// Export default registry
export * from "./cell-renderers/defaultRegistry"

// Export schema utils
export * from "./schema/schema-utils"

// Export serialization utils
export * from "./schema/serialization"

// Export hooks
export * from "./hooks"
