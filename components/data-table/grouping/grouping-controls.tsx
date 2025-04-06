"use client"

import * as React from "react"
import { useDataTable } from "../core/context"
import { Button } from "@/components/ui/button"
import { Layers } from "lucide-react"
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
import { getGroupableColumns } from "../schema/schema-utils"
import { hasAccessorKey } from "../utils"
import { GroupableColumn } from "../types"

/**
 * Grouping Controls component
 * 
 * Provides a button to open the grouping dialog and show active groups.
 */
export function GroupingControls() {
  const {
    schema,
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
  )
} 