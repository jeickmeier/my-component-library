"use client"

import React from "react"
import { Cell, Row, ColumnDef } from "@tanstack/react-table"
import { getGlobalCellRendererRegistry } from "@/components/data-table/cell-renderers"

/**
 * Props for the DataTableCell component.
 * 
 * @template TData The type of data in the table rows
 * @property cell The TanStack Table cell instance containing value and context
 */
interface DataTableCellProps<TData> {
  cell: Cell<TData, unknown>
}

// Global registry reference to avoid re-fetching on each render
const cellRendererRegistry = getGlobalCellRendererRegistry();

/**
 * A unified cell component that handles rendering of table cells.
 * 
 * This component acts as a smart wrapper around cell rendering, supporting:
 * - Regular cell values
 * - Aggregated values (when using grouping)
 * - Custom cell renderers through a registry system
 * - Grouped and expanded states
 * 
 * The component uses a cell renderer registry to determine how to display cell content.
 * If no specific renderer is defined, it falls back to basic text rendering.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <DataTableCell cell={cell} />
 * 
 * // With custom renderer in column definition
 * const columns = [{
 *   id: 'status',
 *   cellRenderer: {
 *     type: 'badge',
 *     config: { colors: { active: 'green' } }
 *   }
 * }]
 * ```
 */
export const DataTableCell = React.memo(
  function DataTableCellInner<TData = unknown>({ cell }: DataTableCellProps<TData>) {
    const row = cell.getContext().row as Row<TData>
    const column = cell.column
    const columnDef = column.columnDef as ColumnDef<TData, unknown> & {
      cellRenderer?: { type: string; config?: Record<string, unknown> }
    }
    
    // Get cell renderer type from column definition
    const rendererType = columnDef.cellRenderer?.type || 'text'
    const rendererConfig = columnDef.cellRenderer?.config || {}
    
    // Get the cell renderer from registry - memoized to avoid lookups
    const renderer = React.useMemo(() => {
      return cellRendererRegistry.get(rendererType);
    }, [rendererType])
    
    // Memoize the value extraction to avoid recalculation on re-renders
    const cellValue = React.useMemo(() => cell.getValue(), [cell])
    
    // Get row properties once and memoize them
    const isGrouped = React.useMemo(() => Boolean(row.getIsGrouped()), [row])
    const isExpanded = React.useMemo(() => 
      isGrouped && Boolean(row.getIsExpanded && row.getIsExpanded()), 
      [row, isGrouped]
    )
    const isAggregated = React.useMemo(() => 
      Boolean(row.subRows?.length && isGrouped), 
      [row.subRows?.length, isGrouped]
    )
    
    // Prepare props for the renderer - memoized to prevent unnecessary object creation
    const rendererProps = React.useMemo(() => ({
      row: {
        getValue: (columnId: string) => row.getValue(columnId),
        original: row.original,
      },
      column: {
        id: column.id,
      },
      getValue: () => cellValue,
      isAggregated,
      isGrouped,
      isExpanded,
    }), [row, column.id, cellValue, isAggregated, isGrouped, isExpanded])
    
    // Render the cell using the appropriate renderer
    if (renderer && typeof renderer === 'function') {
      return <>{renderer(rendererProps, rendererConfig)}</>
    }
    
    // Fallback to basic text rendering if no renderer found - directly use the memoized value
    return <>{String(cellValue ?? '')}</>
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Get values for comparison
    const prevValue = prevProps.cell.getValue();
    const nextValue = nextProps.cell.getValue();
    
    // Get rows for comparison
    const prevRow = prevProps.cell.getContext().row;
    const nextRow = nextProps.cell.getContext().row;
    
    // Compare basic properties
    const valueEqual = prevValue === nextValue;
    const isGroupedEqual = prevRow.getIsGrouped() === nextRow.getIsGrouped();
    
    // Only check expanded state if the row is grouped
    let expandedEqual = true;
    if (prevRow.getIsGrouped() && nextRow.getIsGrouped()) {
      expandedEqual = prevRow.getIsExpanded() === nextRow.getIsExpanded();
    }
    
    // Return true if equal (no need to re-render)
    return valueEqual && isGroupedEqual && expandedEqual;
  }
) 