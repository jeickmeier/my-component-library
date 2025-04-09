"use client"

/**
 * @module data-table/parts/toolbar
 * @description Provides the table toolbar with global search, export, and grouping controls.
 */

// React + Lib Imports
import * as React from "react"
import { Settings, Download } from "lucide-react"

// Internal Imports
import { useDataTable } from "../core/context"
import { TableConfigurationPanel } from "./table-configuration-panel"
import { getGroupableColumns } from "../schema" // Assuming this utility handles schema logic
import { hasAccessorKey, exportToCSV } from "../utils" // Assuming general utils
import type { GroupableColumn as ConfigurableColumn } from "../types"

// UI Imports
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * Renders the toolbar for the data table.
 * Includes optional global filter input, CSV export button, and grouping dialog trigger/content.
 * Feature visibility is controlled by flags in the table schema.
 */
export function Toolbar<TData>() {
  // --- State & Hooks ---
  const {
    schema,
    data,
    globalFilter,
    setGlobalFilter,
    grouping,
    setGrouping,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
  } = useDataTable<TData>()

  const [isGroupingDialogOpen, setIsGroupingDialogOpen] = React.useState(false)

  // Local state for debounced filter input
  const [filterValue, setFilterValue] = React.useState(globalFilter || "")
  
  // Reference for debouncing timeout
  const filterTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  // Update local state when global filter changes externally
  React.useEffect(() => {
    setFilterValue(globalFilter || "")
  }, [globalFilter])
  
  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current)
      }
    }
  }, [])

  // --- Memoized Calculations ---
  // Get groupable column IDs (still needed for checking below)
  const groupableColumns = React.useMemo(() => getGroupableColumns(schema), [schema])

  // Create a list of ALL columns with labels and groupable status
  const configurableColumnObjects = React.useMemo(() => {
    // Map over all columns defined in the schema
    return schema.columns.map(colDef => {
      const columnId = colDef.id || (hasAccessorKey(colDef) ? colDef.accessorKey : undefined);
      
      // Skip if we can't determine a column ID
      if (!columnId) return null;

      // Determine if the column is groupable (using the pre-calculated list)
      const isGroupable = groupableColumns.includes(columnId);

      // Generate label from header or fallback to capitalized ID
      const label = typeof colDef.header === 'string' 
        ? colDef.header 
        : (columnId.charAt(0).toUpperCase() + columnId.slice(1));

      return {
        id: columnId,
        label: label,
        isGroupable: isGroupable // <-- Add groupable status
      }
    }).filter(Boolean); // Filter out any null entries
  }, [schema, groupableColumns]) // Update dependencies

  // --- Event Handlers ---
  const handleExportCSV = React.useCallback(() => {
    // Pass necessary data to the utility function
    exportToCSV(data, schema.columns, 'table-export') 
  }, [data, schema.columns]) // Dependencies for export

  // Handle input change with debouncing
  const handleGlobalFilterChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setFilterValue(newValue)
    
    // Clear any existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current)
    }
    
    // Set new timeout for the filter update
    const debounceMs = schema.filterDebounceMs || 300
    filterTimeoutRef.current = setTimeout(() => {
      setGlobalFilter(newValue || "")
    }, debounceMs)
  }, [setGlobalFilter, schema.filterDebounceMs])
  
  // Apply filter immediately on key press
  const handleFilterKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Clear any pending timeout
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current)
      }
      
      // Apply filter immediately
      setGlobalFilter(filterValue || "")
    }
  }, [setGlobalFilter, filterValue])

  // --- Render Logic ---
  const showGlobalFilter = schema.enableGlobalFilter !== false;
  const showExport = schema.enableExport !== false;
  const showGrouping = schema.enableGrouping && groupableColumns.length > 0;

  return (
    <div className="flex items-center justify-between py-2">
      {/* Left Side: Global Filter */}
      <div className="flex items-center gap-1">
        {showGlobalFilter && (
          <Input
            placeholder="Search all columns..."
            value={filterValue}
            onChange={handleGlobalFilterChange}
            onKeyDown={handleFilterKeyDown}
            className="h-8 w-48 sm:w-64 text-sm"
          />
        )}
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-2">
        {/* Export CSV Button */}
        {showExport && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-sm"
            onClick={handleExportCSV}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        )}

        {/* Grouping Dialog Trigger/Content */}
        {showGrouping && (
          <Dialog open={isGroupingDialogOpen} onOpenChange={setIsGroupingDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1 text-sm"
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Configure</span>
                {grouping.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1.5 rounded-sm px-1.5 font-normal text-xs"
                  >
                    {grouping.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Configure Table</DialogTitle>
                <DialogDescription>
                  Manage column visibility, order, and grouping. Drag items to reorder.
                </DialogDescription>
              </DialogHeader>
              <TableConfigurationPanel
                configurableColumns={configurableColumnObjects as ConfigurableColumn[]}
                grouping={grouping}
                onGroupingChange={setGrouping}
                columnOrder={columnOrder}
                onColumnOrderChange={setColumnOrder}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
} 