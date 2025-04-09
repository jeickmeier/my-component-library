"use client"

/**
 * Table Body Module
 * 
 * This module provides the table body component that renders the data rows and cells
 * of the table. It handles row rendering, cell alignment, grouping, aggregation,
 * and expandable rows.
 * 
 * Features:
 * - Row and cell rendering
 * - Automatic cell alignment
 * - Grouping support
 * - Aggregation display
 * - Expandable rows
 * - Empty state handling
 * - Responsive design
 * - Virtualized scrolling for large datasets
 * 
 * @module data-table/parts/table-body
 */

import * as React from "react"
import { Row, Cell } from "@tanstack/react-table"
import { useDataTable } from "../core/context"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { DataTablePartCell } from "./data-table-part-cell"
import { useVirtualization } from "../hooks/useVirtualization"

// Regular expressions to avoid recomputing this on each render
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/

/**
 * Table Body Component
 * 
 * Renders the body section of the data table, including all rows and cells.
 * The component handles various cell types (grouped, aggregated, placeholder)
 * and provides automatic alignment based on data type.
 * 
 * Features:
 * - Row and cell rendering
 * - Automatic cell alignment based on data type
 * - Grouping support with expand/collapse
 * - Aggregation display
 * - Empty state handling
 * - Responsive design
 * - Virtualized scrolling for large datasets with high performance optimizations
 * - Adaptive sizing using ResizeObserver
 * 
 * The component automatically:
 * - Renders all rows and cells
 * - Applies appropriate alignment
 * - Handles grouped and aggregated cells
 * - Shows expand/collapse buttons for grouped rows
 * - Displays row counts for grouped cells
 * - Shows an empty state when no data is available
 * - Uses virtualization for efficient rendering of large datasets
 * - Adapts to container size changes
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TableBody />
 * 
 * // With grouping
 * const columns = [
 *   {
 *     id: 'category',
 *     header: 'Category',
 *     enableGrouping: true
 *   },
 *   {
 *     id: 'value',
 *     header: 'Value',
 *     aggregationFn: 'sum'
 *   }
 * ]
 * ```
 */
export function TableBodyComponent() {
  const { 
    table, 
    schema,
    grouping,
    expanded,
  } = useDataTable<unknown>()
  
  // Keep track of the last seen parent values for each depth level
  const lastParentValues = React.useRef<Record<number, string>>({})
  
  // Get row model
  const rows = table.getRowModel().rows;
  
  // Use virtualization when enabled in schema and we have many rows 
  const shouldVirtualize = schema.enableVirtualization !== false && 
                          rows.length > (schema.virtualizationThreshold || 50);
                          
  // Track which rows have been rendered for caching alignment classes
  const alignmentCache = React.useRef<Map<string, string>>(new Map()).current;
  
  // Track if virtualization is in normal or high-performance mode
  const [highPerformanceMode, setHighPerformanceMode] = React.useState(false);
  
  // Track if initial virtualization has been performed
  const [initializedVirtualization, setInitializedVirtualization] = React.useState(false);
  
  // Generate measurement cache key to reset cache when needed
  const measurementCacheKey = React.useMemo(() => {
    return `${rows.length}-${Object.keys(expanded || {}).length}-${grouping.join('-')}`;
  }, [rows.length, expanded, grouping]);
  
  // Get virtualization options from schema (with defaults)
  const virtualizationOptions = React.useMemo(() => ({
    enabled: shouldVirtualize,
    estimateSize: schema.rowHeight || 35,
    overscan: schema.enableGrouping ? (schema.virtualOverscan || 15) * 3 : (schema.virtualOverscan || 15) * 2, // Significantly increase overscan
    tableHeight: schema.tableHeight || '400px',
    expanded: expanded as Record<string, boolean> | undefined,
    adaptiveHeight: schema.enableAdaptiveSizing !== false,
    optimizationLevel: schema.enableGrouping ? 'medium' as const : 'high' as const, // Lower optimization for grouping
    scrollingDelay: 150,
    measurementCacheKey: `${measurementCacheKey}-${Object.keys(expanded || {}).length}`, // Include expanded state in cache key
    expandedRowSize: schema.enableGrouping ? 300 : 200, // More space for grouped expanded rows
    // Add special handling for grouped rows
    getItemKey: (index: number) => rows[index]?.id || index.toString(),
    paddingEnd: 100, // Add padding at the end to ensure scroll detection works
    // Improved row height estimation based on grouping depth
    estimateSizeByItem: (index: number) => {
      const row = rows[index];
      if (!row) return schema.rowHeight || 35;
      
      const rowHeight = schema.rowHeight || 35;
      const isGrouped = row.getIsGrouped();
      const hasSubRows = row.subRows && row.subRows.length > 0;
      const isExpanded = expanded && typeof expanded === 'object' ? 
        !!(expanded as Record<string, boolean>)[row.id] : false;
      
      // If the row is expanded, use the larger estimated size
      if (isGrouped && isExpanded && hasSubRows) {
        return virtualizationOptions.expandedRowSize || 200; // Use configured expanded size
      } 
      // Adjust height based on row characteristics
      else if (isGrouped) {
        // Group headers need more space
        return rowHeight * 1.2;
      } else if (hasSubRows) {
        // Rows with subrows might need more space
        return rowHeight * 1.1;
      } else if (row.depth > 0) {
        // Child rows in an expanded group
        return rowHeight;
      }
      
      return rowHeight;
    },
    schema: { enableGrouping: schema.enableGrouping } // Pass relevant schema part
  }), [shouldVirtualize, schema.rowHeight, schema.virtualOverscan, schema.tableHeight, 
      expanded, schema.enableAdaptiveSizing, measurementCacheKey, rows, schema.enableGrouping]);
  
  // Initialize enhanced virtualization with performance optimizations
  const {
    parentRef,
    virtualRows,
    totalSize,
    isVirtualized,
    containerSize,
    isScrolling,
    measureRow,
    recalculate, // Use to force recalculation when rows expand/collapse
    scrollToRowId, // Helps scroll to the expanded row
  } = useVirtualization(rows, virtualizationOptions)
  
  // Switch to high-performance mode during scrolling to further reduce frame drops
  React.useEffect(() => {
    setHighPerformanceMode(isScrolling);
    
    // When scrolling stops, force a recalculation to ensure we've loaded all visible rows
    if (!isScrolling && recalculate) {
      // Delayed recalculation after scrolling stops
      const timer = setTimeout(() => {
        recalculate();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isScrolling, recalculate]);
  
  // Force initial recalculation after mount to ensure rows are visible
  React.useEffect(() => {
    if (isVirtualized && recalculate && rows.length > 0 && !initializedVirtualization) {
      // Mark as initialized
      setInitializedVirtualization(true);
      
      // First immediate recalculation
      recalculate();
      
      // Second recalculation after layout has settled
      const timer = setTimeout(() => {
        recalculate();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isVirtualized, recalculate, rows.length, initializedVirtualization, setInitializedVirtualization]);
  
  // Reset initialization flag when key table properties change
  React.useEffect(() => {
    setInitializedVirtualization(false);
  }, [measurementCacheKey, grouping, expanded]);
  
  // Special handling for grouped data - force re-measurement
  React.useEffect(() => {
    if (schema.enableGrouping && isVirtualized && recalculate) {
      // Force recalculation for grouped data
      const timer1 = setTimeout(() => {
        recalculate();
      }, 0);
      
      const timer2 = setTimeout(() => {
        recalculate();
      }, 100);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [schema.enableGrouping, isVirtualized, recalculate, expanded]);
  
  // Determine the effective table height
  // Use the container size if it's available and adaptive sizing is enabled
  const effectiveTableHeight = React.useMemo(() => {
    if (schema.enableAdaptiveSizing !== false && containerSize) {
      return `${containerSize.height}px`;
    }
    return schema.tableHeight || '400px';
  }, [schema.enableAdaptiveSizing, containerSize, schema.tableHeight]);
  
  // VirtualRow type definition to properly handle the enhanced virtual items
  type VirtualRow = {
    index: number;
    start: number;
    size: number;
    measureRef?: (el: HTMLElement | null) => void;
    original?: Row<unknown>;
    isScrolling?: boolean;
    isExpanded?: boolean;
    measure?: (el: HTMLElement | null) => void;
  };
  
  // Create a row reference map outside the render loop
  const rowRefs = React.useRef<Map<string, HTMLDivElement>>(new Map()).current;
  
  // Get alignment class - optimized to reduce calculations during scrolling
  const getAlignmentClass = React.useCallback((cell: Cell<unknown, unknown>) => {
    // First check cache to avoid repeated calculations
    if (alignmentCache.has(cell.id)) {
      return alignmentCache.get(cell.id) || '';
    }
    
    let alignmentClass = ''
    
    // Check if column has explicit alignment set
    const columnDef = cell.column.columnDef as unknown as { 
      alignment?: 'left' | 'center' | 'right';
    }
    
    if (columnDef.alignment) {
      alignmentClass = `text-${columnDef.alignment}`
    } else {
      // Only run this expensive check if we're not in high performance mode
      if (!highPerformanceMode) {
        const value = cell.getValue()
        
        // Align numbers to the right
        if (typeof value === 'number') {
          alignmentClass = 'text-right'
        }
        // Optimized date check with regex first to avoid expensive Date.parse
        else if (value instanceof Date || 
                (typeof value === 'string' && 
                 (DATE_REGEX.test(value) || !isNaN(Date.parse(value as string))))) {
          alignmentClass = 'text-center'
        }
      }
    }
    
    // Cache the result to avoid recalculating
    alignmentCache.set(cell.id, alignmentClass);
    return alignmentClass;
  }, [alignmentCache, highPerformanceMode]);
  
  // Function to measure a row and update its height
  const measureRowHeight = React.useCallback((index: number, rowId: string) => {
    const rowElement = rowRefs.get(rowId);
    if (rowElement && measureRow) {
      measureRow(index, rowElement);
    }
  }, [measureRow, rowRefs]);
  
  // Create a memoized row ref function generator to avoid creating it inside the render callback
  const createRowRefCallback = React.useCallback((rowId: string, index: number) => {
    return (el: HTMLDivElement | null) => {
      if (el) {
        rowRefs.set(rowId, el);
        // Schedule measurement on next frame for better performance
        requestAnimationFrame(() => {
          measureRowHeight(index, rowId);
        });
      } else {
        rowRefs.delete(rowId);
      }
    };
  }, [rowRefs, measureRowHeight]);

  // Handle row expansion with performance optimizations
  const handleRowExpand = React.useCallback((rowId: string) => {
    if (!expanded) return;
    
    // Create a proper copy to avoid mutation
    // Use Record<string, boolean> to ensure we have a type-safe dictionary
    const newExpanded: Record<string, boolean> = {};
    
    // Copy existing expanded state safely, regardless of actual type
    if (expanded && typeof expanded === 'object') {
      Object.entries(expanded).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          newExpanded[key] = value;
        }
      });
    }
    
    // Toggle the current row
    const isCurrentlyExpanded = !!newExpanded[rowId];
    
    if (isCurrentlyExpanded) {
      delete newExpanded[rowId];
    } else {
      newExpanded[rowId] = true;
      
      // Scroll to the expanded row after a short delay to allow rendering
      setTimeout(() => {
        if (scrollToRowId) {
          scrollToRowId(rowId, { align: 'start' });
          
          // After scrolling to the expanded group, force multiple recalculations
          // to ensure all expanded content is properly measured
          setTimeout(() => {
            if (recalculate) {
              // First recalculation to update measurements
              recalculate();
              
              // Second recalculation after a delay to handle any dynamic content
              setTimeout(() => {
                if (recalculate) {
                  recalculate();
                }
              }, 100);
            }
          }, 50);
        }
      }, 150);
    }
    
    // Update the expanded state through the table context
    table.setExpanded(newExpanded);
    
    // Schedule recalculations after the state update completes
    setTimeout(() => {
      if (recalculate) {
        recalculate(); // Recalculate immediately after timeout
        
        // Add further delayed recalculations
        setTimeout(() => {
          if (recalculate) recalculate();
        }, 150); 
        setTimeout(() => {
          if (recalculate) recalculate();
        }, 350);
      }
    }, 10); // Short delay to ensure state update has processed

  }, [expanded, table, recalculate, scrollToRowId]);

  // Render an individual row with optimizations
  const renderVirtualRow = React.useCallback((virtualRow: VirtualRow) => {
    // Get the original row from the virtual item
    const row = virtualRow.original || rows[virtualRow.index];

    // Skip rendering if we don't have a valid row (might happen during updates)
    if (!row) return null;
    
    // Reset tracking when we're at the root level
    if (row.depth === 0) {
      lastParentValues.current = {}
    }
    
    // High performance rendering - reduce non-essential calculations during scrolling
    const visibleCells = row.getVisibleCells();
    const isExpanded = expanded && typeof expanded === 'object' ? 
      !!(expanded as Record<string, boolean>)[row.id] : false;
    const isGrouped = row.getIsGrouped();
    
    // Check if this is the last row in an expanded group
    const isLastInExpandedGroup = isGrouped && isExpanded && row.subRows && row.subRows.length > 0;
    
    // Determine whether the row is currently expanded
    // Use memo to avoid unnecessary calculations during scrolling
    const rowState = isExpanded ? "open" : "closed";
    
    // Get the ref callback for this row (for accurate height measurement)
    const rowRefCallback = virtualRow.measure || createRowRefCallback(row.id, virtualRow.index);
    
    return (
      <React.Fragment key={row.id}>
        <tr
          ref={rowRefCallback as React.RefCallback<HTMLTableRowElement>}
          data-index={virtualRow.index}
          data-row-id={row.id}
          data-row-depth={row.depth}
          data-row-grouped={isGrouped ? "true" : "false"}
          data-state={rowState}
          aria-expanded={isExpanded}
          data-expanded={isExpanded}
          className={`hover:bg-muted/50 data-[state=selected]:bg-muted data-[state=open]:bg-muted/10 border-b transition-colors h-8`}
          style={{ transform: `translateY(${virtualRow.start}px)` }}
        >
          {visibleCells.map((cell: Cell<unknown, unknown>, cellIndex: number) => {
            const alignmentClass = getAlignmentClass(cell);
            const isGroupedColumn = grouping.includes(cell.column.id);
            
            // Check if this cell has expansion capability
            const hasExpandControl = cellIndex === 0 && row.getCanExpand();

            return (
              <td 
                key={cell.id}
                className={`p-1 py-1 align-middle ${alignmentClass} ${isGroupedColumn ? "font-medium" : ""}`}
              >
                {/* Render with proper padding for depth and expansion controls */}
                <div className="flex items-center" style={{ paddingLeft: cellIndex === 0 ? `${row.depth * 1}rem` : 0 }}>
                  {/* Render expansion button if this is an expandable cell */}
                  {hasExpandControl && cellIndex === 0 && (
                    <button
                      type="button"
                      onClick={() => handleRowExpand(row.id)}
                      aria-label={isExpanded ? "Collapse row" : "Expand row"}
                      className="mr-2 rounded-sm p-1 hover:bg-muted"
                    >
                      <span className="transform transition-transform duration-200" 
                            style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        →
                      </span>
                    </button>
                  )}
                  
                  {/* Only render actual cell component if not in high-performance scrolling mode 
                      or if it's a critical cell (e.g., first few columns) */}
                  {(!highPerformanceMode && !virtualRow.isScrolling) || cellIndex < 3 ? (
                    <DataTablePartCell cell={cell} />
                  ) : (
                    // Simplified placeholder during fast scrolling
                    <span className="opacity-80">
                      {typeof cell.getValue() === 'number' ? '0' : '...'}
                    </span>
                  )}
                </div>
              </td>
            )
          })}
        </tr>
        
        {/* Special row for expanded groups with many children to ensure proper scrolling */}
        {isLastInExpandedGroup && (
          <tr className="h-4 opacity-0" aria-hidden="true">
            <td colSpan={visibleCells.length}>
              <div className="h-4 w-full"></div>
            </td>
          </tr>
        )}
      </React.Fragment>
    )
  }, [getAlignmentClass, lastParentValues, grouping, expanded, highPerformanceMode, createRowRefCallback, handleRowExpand, rows]);

  // Create a virtualized table body using a wrapper approach
  if (isVirtualized) {
    // Fallback to standard rendering if virtualization isn't showing rows
    const hasVisibleVirtualRows = virtualRows.length > 0;
    
    // If we don't have any virtual rows but we know there are actual rows,
    // fall back to standard rendering to ensure content is visible
    if (!hasVisibleVirtualRows && rows.length > 0) {
      return (
        <TableBody>
          {rows.slice(0, Math.min(100, rows.length)).map((row: Row<unknown>) => {
            // Reset tracking when we're at the root level
            if (row.depth === 0) {
              lastParentValues.current = {}
            }

            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="h-8"
              >
                {row.getVisibleCells().map((cell: Cell<unknown, unknown>, cellIndex: number) => {
                  const alignmentClass = getAlignmentClass(cell);
                  const isGroupedColumn = grouping.includes(cell.column.id)
                  
                  return (
                    <TableCell 
                      key={cell.id}
                      className={`p-1 py-1 align-middle ${alignmentClass} ${isGroupedColumn ? "font-medium" : ""}`}
                    >
                      {/* Render with proper padding for depth */}
                      <span style={{ paddingLeft: cellIndex === 0 ? `${row.depth * 1}rem` : 0 }}>
                        <DataTablePartCell cell={cell} />
                      </span>
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      );
    }
    
    // Return the virtualized wrapper around the content
    return (
      <TableBody>
        {/* A table row wrapper that holds the virtualized content */}
        <tr style={{ height: `${totalSize}px`, position: 'relative' }}>
          <td 
            colSpan={table.getAllColumns().length} 
            style={{ padding: 0, border: 'none' }}
          >
            {/* The virtualized viewport */}
            <div 
              ref={parentRef} 
              className="overflow-auto absolute inset-0 will-change-scroll"
              style={{ 
                height: effectiveTableHeight,
                WebkitOverflowScrolling: 'touch', // Improve momentum scrolling on iOS
              }}
            >
              {/* Table container to ensure proper table HTML structure */}
              <table className="w-full border-collapse" style={{ position: 'relative' }}>
                <tbody>
                  {/* Render the virtual rows */}
                  {virtualRows.map((virtualRow) => renderVirtualRow(virtualRow))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </TableBody>
    )
  }

  // Standard non-virtualized rendering
  return (
    <TableBody>
      {rows.map((row: Row<unknown>) => {
        // Reset tracking when we're at the root level
        if (row.depth === 0) {
          lastParentValues.current = {}
        }

        return (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className="h-8"
          >
            {row.getVisibleCells().map((cell: Cell<unknown, unknown>, cellIndex: number) => {
              // Determine alignment class
              let alignmentClass = ''
              
              // Check if column has explicit alignment set
              const columnDef = cell.column.columnDef as unknown as { 
                alignment?: 'left' | 'center' | 'right';
              }
              if (columnDef.alignment) {
                alignmentClass = `text-${columnDef.alignment}`
              }
              // Otherwise use auto-detection based on data type
              else {
                const value = cell.getValue()
                
                // Align numbers to the right
                if (typeof value === 'number') {
                  alignmentClass = 'text-right'
                }
                // Align dates to the center
                else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value as string)))) {
                  alignmentClass = 'text-center'
                }
              }

              const isGroupedColumn = grouping.includes(cell.column.id)
              
              return (
                <TableCell 
                  key={cell.id}
                  className={`p-1 py-1 align-middle ${alignmentClass} ${isGroupedColumn ? "font-medium" : ""}`}
                >
                  {/* Render with proper padding for depth */}
                  <span style={{ paddingLeft: cellIndex === 0 ? `${row.depth * 1}rem` : 0 }}>
                    <DataTablePartCell cell={cell} />
                  </span>
                </TableCell>
              )
            })}
          </TableRow>
        )
      })}
    </TableBody>
  )
} 