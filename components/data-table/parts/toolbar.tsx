"use client"

/**
 * @module data-table/parts/toolbar
 * @description Provides the table toolbar with global search, export, and grouping controls.
 */

// React + Lib Imports
import * as React from "react"
import { Layers, Download } from "lucide-react"

// Internal Imports
import { useDataTable } from "../core/context"
import { GroupingPanel } from "./grouping-panel"
import { getGroupableColumns } from "../schema" // Assuming this utility handles schema logic
import { hasAccessorKey, exportToCSV } from "../utils" // Assuming general utils
import type { GroupableColumn, DataTableColumnDef } from "../types"

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
  } = useDataTable<TData>()

  const [isGroupingDialogOpen, setIsGroupingDialogOpen] = React.useState(false)

  // --- Memoized Calculations ---
  // Get groupable column IDs (utility likely handles schema details)
  const groupableColumns = React.useMemo(() => getGroupableColumns(schema), [schema])

  // Create a list of groupable columns with labels for the panel
  const groupableColumnObjects = React.useMemo(() => {
    return groupableColumns.map(columnId => {
      // Find the corresponding column definition for the label
      const col = schema.columns.find(c => {
        const def = c as DataTableColumnDef<TData>
        if (def.id === columnId) return true
        return hasAccessorKey(def) && def.accessorKey === columnId
      })
      // Generate label from header or fallback to capitalized ID
      const label = typeof col?.header === 'string' 
        ? col.header 
        : (columnId.charAt(0).toUpperCase() + columnId.slice(1));
      return { id: columnId, label }
    })
    // Dependency: schema.columns for headers, groupableColumns for IDs
  }, [schema.columns, groupableColumns]) 

  // --- Event Handlers ---
  const handleExportCSV = React.useCallback(() => {
    // Pass necessary data to the utility function
    exportToCSV(data, schema.columns, 'table-export') 
  }, [data, schema.columns]) // Dependencies for export

  const handleGlobalFilterChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(event.target.value)
  }, [setGlobalFilter])

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
            value={globalFilter ?? ""}
            onChange={handleGlobalFilterChange}
            className="h-8 w-48 sm:w-64 text-sm" // Use h-8 text-sm
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
            className="h-8 gap-1 text-sm" // Use h-8 text-sm
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
                className="h-8 gap-1 text-sm" // Use h-8 text-sm
              >
                <Layers className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Group By</span>
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
                <DialogTitle>Manage Column Grouping</DialogTitle>
                <DialogDescription>
                  Drag columns to change group order. Add or remove columns to group by.
                </DialogDescription>
              </DialogHeader>
              <GroupingPanel
                availableColumns={groupableColumnObjects as GroupableColumn[]}
                grouping={grouping}
                onGroupingChange={setGrouping}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
} 