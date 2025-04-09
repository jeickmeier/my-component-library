import * as React from "react"
import { Table, ColumnDef } from "@tanstack/react-table"
import { useResizeObserver } from "./useResizeObserver"
import { debounce } from "../utils/debounce"

interface UseAdaptiveColumnsOptions {
  /**
   * Whether to enable adaptive column sizing
   */
  enabled?: boolean
  /**
   * Minimum width for columns in pixels
   */
  minColumnWidth?: number
  /**
   * Maximum width for columns in pixels (0 means no limit)
   */
  maxColumnWidth?: number
  /**
   * Throttle time for resize calculations in milliseconds
   */
  resizeThrottleMs?: number
  /**
   * Whether to distribute remaining space proportionally
   * If false, all columns get equal share of remaining space
   */
  proportionalDistribution?: boolean
}

/**
 * Hook for managing adaptive column widths based on container size
 * 
 * This hook adjusts column widths based on the container size and content
 * to optimize the space utilization. It respects min/max width constraints
 * and distributes available space among columns.
 *
 * @param table The table instance
 * @param containerRef Reference to the container element
 * @param options Configuration options
 * @returns Column width state and utilities
 */
export function useAdaptiveColumns<TData>(
  table: Table<TData>,
  containerRef: React.RefObject<HTMLElement | null>,
  {
    enabled = false,
    minColumnWidth = 50,
    maxColumnWidth = 0,
    resizeThrottleMs = 200,
    proportionalDistribution = true,
  }: UseAdaptiveColumnsOptions = {}
) {
  // Track column widths
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({})
  
  // Observe container size changes
  const { size: containerSize } = useResizeObserver({ targetRef: containerRef })
  
  // Memoize columns to compare for changes
  const columns = React.useMemo(() => table.getAllColumns(), [table])
  
  // Calculate column widths based on container size and content
  const calculateColumnWidths = React.useCallback(() => {
    if (!enabled || !containerSize || !containerRef.current) return
    
    const { width: containerWidth } = containerSize
    const visibleColumns = table.getVisibleLeafColumns()
    const columnCount = visibleColumns.length
    
    if (columnCount === 0) return
    
    // Get column size hints from column definitions
    const columnSizeHints = visibleColumns.map(column => {
      const colDef = column.columnDef as ColumnDef<TData> & { 
        minWidth?: number;
        maxWidth?: number;
        width?: number;
        sizePriority?: number;
      }
      
      return {
        id: column.id,
        minWidth: colDef.minWidth || minColumnWidth,
        maxWidth: colDef.maxWidth || maxColumnWidth,
        width: colDef.width,
        sizePriority: colDef.sizePriority || 1,
      }
    })
    
    // Start with minimum widths for all columns
    let allocatedWidth = 0
    const initialWidths: Record<string, number> = {}
    
    columnSizeHints.forEach(col => {
      // Use defined width or minWidth
      const width = col.width || col.minWidth
      initialWidths[col.id] = width
      allocatedWidth += width
    })
    
    // Calculate remaining width to distribute
    const remainingWidth = Math.max(0, containerWidth - allocatedWidth)
    
    if (remainingWidth > 0) {
      // Distribute remaining width among columns
      if (proportionalDistribution) {
        // Distribute proportionally based on sizePriority
        const totalPriority = columnSizeHints.reduce((sum, col) => sum + col.sizePriority, 0)
        
        columnSizeHints.forEach(col => {
          const share = (col.sizePriority / totalPriority) * remainingWidth
          const newWidth = initialWidths[col.id] + share
          
          // Respect maxWidth if defined
          if (col.maxWidth && col.maxWidth > 0 && newWidth > col.maxWidth) {
            initialWidths[col.id] = col.maxWidth
          } else {
            initialWidths[col.id] = newWidth
          }
        })
      } else {
        // Distribute equally
        const sharePerColumn = remainingWidth / columnCount
        
        columnSizeHints.forEach(col => {
          const newWidth = initialWidths[col.id] + sharePerColumn
          
          // Respect maxWidth if defined
          if (col.maxWidth && col.maxWidth > 0 && newWidth > col.maxWidth) {
            initialWidths[col.id] = col.maxWidth
          } else {
            initialWidths[col.id] = newWidth
          }
        })
      }
    }
    
    // Update state with new column widths
    setColumnWidths(initialWidths)
  }, [enabled, containerSize, containerRef, table, minColumnWidth, maxColumnWidth, proportionalDistribution])
  
  // Debounced calculation function to prevent excessive recalculations
  const debouncedCalculation = React.useMemo(
    () => debounce(calculateColumnWidths, resizeThrottleMs),
    [calculateColumnWidths, resizeThrottleMs]
  )
  
  // Recalculate column widths when container size changes
  React.useEffect(() => {
    if (enabled && containerSize) {
      debouncedCalculation()
    }
  }, [enabled, containerSize, debouncedCalculation])
  
  // Recalculate when columns change
  React.useEffect(() => {
    if (enabled) {
      debouncedCalculation()
    }
  }, [enabled, columns, debouncedCalculation])
  
  // Apply column widths to the table
  const applyColumnWidths = React.useCallback(() => {
    if (!enabled || Object.keys(columnWidths).length === 0) return
    
    table.getAllLeafColumns().forEach(column => {
      if (columnWidths[column.id]) {
        column.getSize = () => columnWidths[column.id]
      }
    })
  }, [enabled, columnWidths, table])
  
  // Apply column widths when they change
  React.useEffect(() => {
    applyColumnWidths()
  }, [columnWidths, applyColumnWidths])
  
  return {
    columnWidths,
    recalculate: calculateColumnWidths,
    isEnabled: enabled,
  }
} 