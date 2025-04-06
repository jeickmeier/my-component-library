"use client"

/**
 * Data Table Component Module
 * 
 * This module provides the main DataTable component implementation, serving as the
 * primary entry point for the data table system. It implements a composable
 * architecture that separates the table's presentation from its state management.
 * 
 * The module consists of two components:
 * 1. DataTable - The main public component that users interact with
 * 2. DataTableContent - An internal component that handles the actual rendering
 * 
 * Key Features:
 * - Schema-based configuration
 * - Context-based state management
 * - Composable structure
 * - Built-in toolbar and pagination
 * - Responsive design
 * 
 * @module data-table/core/data-table
 */

import * as React from "react"
import { DataTableProvider } from "./context"
import { DataTableProps } from "../types"
import { Table } from "@/components/ui/table"
import { TableHeader, TableBody, Toolbar, Pagination } from "../parts"

/**
 * Main DataTable component
 * 
 * A flexible and feature-rich data table component that provides a complete
 * solution for displaying and manipulating tabular data. It serves as a facade
 * for the underlying table implementation, handling the integration between
 * the schema configuration, data, and table features.
 * 
 * Features:
 * - Schema-based configuration for columns and behavior
 * - Dynamic data handling with automatic updates
 * - Built-in sorting, filtering, and pagination
 * - Column visibility and ordering
 * - Grouping and aggregation support
 * - Responsive design and accessibility
 * 
 * The component uses a provider pattern to manage state, making it easy to
 * extend and customize while maintaining a clean separation of concerns.
 * 
 * @template TData The type of data being displayed in the table
 * 
 * @param props Component properties
 * @param props.schema Configuration schema defining table structure and behavior
 * @param props.data Array of data items to display in the table
 * 
 * @example
 * ```tsx
 * // Basic usage with minimal configuration
 * const schema = {
 *   columns: [
 *     { accessorKey: 'name', header: 'Name' },
 *     { accessorKey: 'age', header: 'Age' }
 *   ]
 * };
 * 
 * const data = [
 *   { name: 'John', age: 30 },
 *   { name: 'Jane', age: 25 }
 * ];
 * 
 * return <DataTable schema={schema} data={data} />;
 * 
 * // Advanced usage with features enabled
 * const advancedSchema = {
 *   columns: [
 *     {
 *       accessorKey: 'name',
 *       header: 'Name',
 *       filter: { type: 'text' }
 *     },
 *     {
 *       accessorKey: 'age',
 *       header: 'Age',
 *       aggregationType: 'average'
 *     }
 *   ],
 *   enablePagination: true,
 *   enableGrouping: true,
 *   defaultPageSize: 25
 * };
 * 
 * return <DataTable schema={advancedSchema} data={data} />;
 * ```
 */
export function DataTable<TData>({
  schema,
  data,
}: DataTableProps<TData>) {
  return (
    <DataTableProvider schema={schema} data={data}>
      <DataTableContent />
    </DataTableProvider>
  )
}

/**
 * Internal DataTable content component
 * 
 * Renders the actual table structure and its associated controls. This component
 * consumes the DataTable context and organizes the table's visual structure.
 * 
 * Layout Structure:
 * 1. Toolbar - Contains table controls and actions
 *    - Column visibility toggles
 *    - Global search
 *    - Custom actions
 * 
 * 2. Table Container - Main data display area
 *    - Responsive border and rounded corners
 *    - Header with sort and filter controls
 *    - Body with data rows and formatting
 * 
 * 3. Pagination - Controls for navigating through data pages
 *    - Page size selection
 *    - Page navigation
 *    - Page information
 * 
 * The component uses a vertical stack layout with consistent spacing and
 * applies styling for a modern, clean appearance.
 * 
 * @private
 */
function DataTableContent() {
  return (
    <div className="space-y-2">
      <Toolbar />
      <div className="rounded-md border">
        <Table>
          <TableHeader />
          <TableBody />
        </Table>
      </div>
      <Pagination />
    </div>
  )
} 