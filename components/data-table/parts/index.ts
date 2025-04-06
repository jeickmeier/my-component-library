/**
 * Data Table Parts Module
 * 
 * This module provides the core structural components that make up the data table.
 * These components work together to create a complete table interface with all necessary
 * functionality and visual elements.
 * 
 * Key Components:
 * - TableHeader: Renders the table header with column headers and sorting controls
 * - TableBody: Renders the table body with rows and cells
 * - TableCell: Renders individual table cells with proper formatting
 * - Toolbar: Provides table controls and actions
 * - Pagination: Handles table pagination and page navigation
 * 
 * Features:
 * - Modular table structure
 * - Consistent styling
 * - Responsive design
 * - Accessibility support
 * - Flexible customization
 * 
 * @module data-table/parts
 */

export { TableHeaderComponent as TableHeader } from './table-header'
export { TableBodyComponent as TableBody } from './table-body'
export { TableCell } from './table-cell'
export { Toolbar } from './toolbar'
export { Pagination } from './pagination' 