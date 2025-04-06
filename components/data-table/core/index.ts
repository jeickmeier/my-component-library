/**
 * Data Table Core Module
 * 
 * This module serves as the central hub for the data table implementation,
 * exporting the main components and hooks that form the foundation of the
 * data table system.
 * 
 * Key Exports:
 * - DataTable: The main component for rendering data tables
 * - DataTableProvider: Context provider for table state management
 * - useDataTable: Hook for accessing table state and operations
 * 
 * The core module implements a composable architecture where the main DataTable
 * component serves as a facade, while the context provider manages the complex
 * state and operations behind the scenes.
 * 
 * @module data-table/core
 */

export { DataTable } from "./data-table"
export { DataTableProvider, useDataTable } from "./context" 