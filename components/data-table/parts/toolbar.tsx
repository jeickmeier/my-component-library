"use client"

/**
 * Toolbar Module
 * 
 * This module provides the toolbar component for the data table, which includes
 * search functionality, export controls, and grouping management. The toolbar
 * integrates with the data table's context to provide a consistent interface
 * for table operations.
 * 
 * Features:
 * - Global search functionality
 * - CSV export capability
 * - Grouping management
 * - Responsive design
 * - Accessibility support
 * 
 * @module data-table/parts/toolbar
 */

import * as React from "react"
import { useDataTable } from "../core/context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Layers, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GroupingPanel } from "./grouping-panel"
import { getGroupableColumns } from "../schema"
import { hasAccessorKey, exportToCSV } from "../utils"
import { GroupableColumn } from "../types"

/**
 * Toolbar Component
 * 
 * A comprehensive toolbar component that provides search, export, and grouping
 * functionality for the data table. It integrates with the table's context to
 * manage global filtering, data export, and column grouping.
 * 
 * Features:
 * - Global search with customizable placeholder
 * - CSV export with automatic filename generation
 * - Grouping management with drag-and-drop support
 * - Visual feedback for active groups
 * - Responsive design
 * - Accessibility support
 * 
 * The component automatically:
 * - Renders search input when enabled
 * - Provides export functionality when enabled
 * - Shows grouping controls when enabled
 * - Displays active group count
 * - Manages grouping dialog state
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Toolbar />
 * 
 * // With custom configuration
 * const schema = {
 *   enableGlobalFilter: true,
 *   enableExport: true,
 *   enableGrouping: true,
 *   columns: [
 *     {
 *       id: 'name',
 *       header: 'Name',
 *       enableGrouping: true
 *     }
 *   ]
 * }
 * ```
 */
export function Toolbar() {
  const {
    schema,
    data,
    globalFilter,
    setGlobalFilter,
    grouping,
    setGrouping,
  } = useDataTable()

  const [isGroupingDialogOpen, setIsGroupingDialogOpen] = React.useState(false)

  // Get groupable column IDs
  const groupableColumns = React.useMemo(() => getGroupableColumns(schema), [schema])

  // Create a list of groupable columns with labels
  const groupableColumnObjects = React.useMemo(() => {
    return groupableColumns.map(columnId => {
      const col = schema.columns.find(c => {
        if (c.id === columnId) return true;
        // Check if column has accessorKey that matches
        return hasAccessorKey(c) && c.accessorKey === columnId;
      })
      return {
        id: columnId,
        label: typeof col?.header === 'string' 
          ? col.header 
          : (columnId.charAt(0).toUpperCase() + columnId.slice(1)),
      }
    })
  }, [schema.columns, groupableColumns])

  // Handle CSV export
  const handleExportCSV = () => {
    exportToCSV(data, schema.columns, 'table-export')
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {schema.enableGlobalFilter !== false && (
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-64 h-7 text-xs"
          />
        )}
      </div>
      <div className="flex items-center gap-1">
        {/* Export CSV Button */}
        {schema.enableExport !== false && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-7 text-xs"
            onClick={handleExportCSV}
          >
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
        )}

        {/* Grouping Dialog */}
        {schema.enableGrouping && groupableColumns.length > 0 && (
          <Dialog open={isGroupingDialogOpen} onOpenChange={setIsGroupingDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 h-7 text-xs"
              >
                <Layers className="h-3 w-3" />
                Group By
                {grouping.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 rounded-sm px-1 font-normal text-xs"
                  >
                    {grouping.length}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Table Grouping</DialogTitle>
                <DialogDescription>
                  Group your data by one or more columns to create hierarchical views. Drag to reorder groups.
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