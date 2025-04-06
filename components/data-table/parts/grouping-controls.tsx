"use client"

/**
 * Grouping Controls Module
 * 
 * This module provides a button and dialog interface for managing table grouping.
 * It integrates with the data table context to provide a seamless grouping experience.
 * 
 * Features:
 * - Group management dialog
 * - Active group count display
 * - Schema-based group validation
 * - Responsive design
 * - Keyboard accessibility
 * 
 * @module data-table/parts/grouping-controls
 */

import * as React from "react"
import { useDataTable } from "../core/context"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TableConfigurationPanel } from "./table-configuration-panel"
import { getGroupableColumns } from "../schema/schema-utils"
import { hasAccessorKey } from "../utils"
import type { GroupableColumn as ConfigurableColumn } from "../types"

/**
 * Grouping Controls Component
 * 
 * A component that provides a button to open the grouping dialog and displays the
 * number of active groups. It integrates with the data table context to manage
 * grouping state and provides a user-friendly interface for group management.
 * 
 * Features:
 * - Group management dialog
 * - Active group count display
 * - Schema-based group validation
 * - Responsive design
 * - Keyboard accessibility
 * 
 * The component automatically hides itself if:
 * - Grouping is disabled in the schema
 * - There are no groupable columns available
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <GroupingControls />
 * ```
 */
export function GroupingControls<TData>() {
  const {
    schema,
    grouping,
    setGrouping,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
  } = useDataTable<TData>()

  const [isGroupingDialogOpen, setIsGroupingDialogOpen] = React.useState(false)

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

  // If grouping is not enabled or there are no groupable columns, don't render anything
  if (!schema.enableGrouping || groupableColumns.length === 0) {
    return null
  }

  return (
    <Dialog open={isGroupingDialogOpen} onOpenChange={setIsGroupingDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 h-7 text-xs"
        >
          <Settings className="h-3.5 w-3.5" />
          Configure
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
  )
} 