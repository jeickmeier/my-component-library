"use client"

/**
 * Table Configuration Panel Module
 * 
 * This module provides components for managing table row grouping and column visibility/order 
 * through a user interface. It includes draggable lists for active groups and visible columns,
 * and controls for adding/removing items.
 * 
 * Features:
 * - Drag-and-drop group reordering
 * - Drag-and-drop column reordering/visibility control
 * - Visual configuration management
 * - Group/Column addition/removal
 * - Keyboard accessibility
 * - Responsive design
 * 
 * @module data-table/parts/table-configuration-panel
 */

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type {
  GroupingState,
  ColumnOrderState,
  VisibilityState,
  Updater,
} from "@tanstack/react-table"

import { GripVertical, Plus, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Renamed GroupableColumn to ConfigurableColumn for broader scope
import type { GroupableColumn as ConfigurableColumn } from "../types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Props for the SortableItem component
 */
interface SortableItemProps {
  /** Unique identifier for the item (column ID) */
  id: UniqueIdentifier
  /** Display label for the item */
  label: string
  /** Callback function when the item is removed */
  onRemove: (id: string) => void
  /** Optional flag indicating if the item is currently grouped */
  isGrouped?: boolean
}

/**
 * Sortable Item Component
 * 
 * A draggable item representing a group or a visible column in the configuration panel. 
 * It includes a drag handle, label, and remove button.
 * 
 * @param props Component properties
 */
const SortableItem = ({ id, label, onRemove, isGrouped }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleRemove = React.useCallback(() => {
    onRemove(id as string)
  }, [id, onRemove])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex h-7 max-w-xs items-center gap-1 rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground",
        isGrouped && "bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200" // Conditional styling
      )}
      title={label}
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 flex-shrink-0"
        aria-label={`Drag ${label}`}
      >
        <GripVertical className="h-4 w-4" />
      </span>
      <span className="select-none truncate flex-grow min-w-0">{label}</span>
      <Button
        variant="ghost"
        size="icon"
        className="ml-1 h-6 w-6 hover:bg-muted flex-shrink-0"
        onClick={handleRemove}
        aria-label={`Remove ${label}`}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

/**
 * Props for the TableConfigurationPanel component
 */
interface TableConfigurationPanelProps {
  /** List of columns that can be configured (grouped, ordered, visibility toggled) */
  configurableColumns: ConfigurableColumn[]
  /** Current grouping state */
  grouping: GroupingState
  /** Callback function when grouping changes */
  onGroupingChange: (grouping: GroupingState) => void
  /** Current column order state (represents visible, ordered columns) */
  columnOrder: ColumnOrderState
  /** Callback function when column order changes */
  onColumnOrderChange: (order: ColumnOrderState) => void
  /** Current column visibility state */
  columnVisibility: VisibilityState
  /** Callback function when column visibility changes */
  onColumnVisibilityChange: (updater: Updater<VisibilityState>) => void
}

/**
 * Table Configuration Panel Component
 * 
 * A panel component providing a UI for managing table row grouping and column visibility/order.
 * Allows users to add, remove, and reorder groups and visible columns via drag-and-drop.
 * 
 * @param props Component properties
 */
export function TableConfigurationPanel({
  configurableColumns,
  grouping,
  onGroupingChange,
  columnOrder,
  onColumnOrderChange,
  columnVisibility,
  onColumnVisibilityChange,
}: TableConfigurationPanelProps) {
  // DnD hook instance for Grouping
  const { 
    sensors: groupingSensors, 
    handleDragEnd: handleGroupingDragEnd 
  } = useConfigurationDnD(grouping, onGroupingChange)
  
  // DnD hook instance for Column Order
  const { 
    sensors: columnOrderSensors, 
    handleDragEnd: handleColumnOrderDragEnd 
  } = useConfigurationDnD(columnOrder, onColumnOrderChange)

  // Filter columnOrder based on visibility before using it
  const visibleOrderedColumns = React.useMemo(() => 
    columnOrder.filter(id => columnVisibility[id] !== false),
    [columnOrder, columnVisibility]
  );

  // Memoized active group items for DnD
  const activeGroupItems = React.useMemo(() => grouping.map(id => ({ id })), [grouping])
  
  // Memoized active column order items for DnD (use filtered list)
  const activeColumnOrderItems = React.useMemo(() => visibleOrderedColumns.map(id => ({ id })), [visibleOrderedColumns])

  // --- Grouping Callbacks ---
  const handleRemoveGroup = React.useCallback((columnId: string) => {
    onGroupingChange(grouping.filter((g) => g !== columnId))
  }, [grouping, onGroupingChange])

  const handleAddGroup = React.useCallback((columnId: string) => {
    // Ensure the selected column is actually groupable
    const column = configurableColumns.find(c => c.id === columnId)
    // Assuming any column in configurableColumns can be grouped, 
    // or filtering happens in the parent component.
    if (column && !grouping.includes(columnId)) {
      onGroupingChange([...grouping, columnId])
    }
  }, [grouping, onGroupingChange, configurableColumns])

  // Filter the full list of configurable columns to find those available for grouping
  const columnsToAddForGrouping = React.useMemo(() => 
    configurableColumns.filter(
      (column) => column.isGroupable && !grouping.includes(column.id)
    ),
    [configurableColumns, grouping] // Use configurableColumns and grouping as dependencies
  )

  // --- Column Order Callbacks ---
  const handleRemoveColumnFromOrder = React.useCallback((columnId: string) => {
    onColumnOrderChange(columnOrder.filter((id) => id !== columnId))
    onColumnVisibilityChange((old) => ({ ...old, [columnId]: false }))
  }, [columnOrder, onColumnOrderChange, onColumnVisibilityChange])

  const handleAddColumnToOrder = React.useCallback((columnId: string) => {
    if (columnId) { // Basic check that we have an ID
      // Always ensure the column is marked as visible
      onColumnVisibilityChange((old) => ({ ...old, [columnId]: true }));
      
      // If the column isn't already in the order, add it to the end
      if (!columnOrder.includes(columnId)) {
        onColumnOrderChange([...columnOrder, columnId]);
      }
    }
  }, [columnOrder, onColumnOrderChange, onColumnVisibilityChange]);

  const columnsToAddForOrdering = React.useMemo(() =>
    // Filter columns that are explicitly marked as hidden in the visibility state
    configurableColumns.filter(
      (column) => columnVisibility[column.id] === false
    ),
    [configurableColumns, columnVisibility]
  )

  // Find column label helper
  const getColumnLabel = (columnId: string): string => {
    return configurableColumns.find(col => col.id === columnId)?.label ?? columnId
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Grouping Section */}
      <div className="space-y-3 border-b pb-6">
        <h3 className="text-sm font-medium text-foreground">Grouping</h3>
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Active groups (drag to reorder):</span>
          {grouping.length > 0 ? (
            <DndContext
              sensors={groupingSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleGroupingDragEnd}
            >
              <SortableContext items={activeGroupItems} strategy={verticalListSortingStrategy}>
                <div className="flex flex-wrap gap-2">
                  {grouping.map((columnId) => (
                    <SortableItem 
                      key={columnId} 
                      id={columnId} 
                      label={getColumnLabel(columnId)} 
                      onRemove={handleRemoveGroup} 
                    />
                  ))}
                </div>
              </SortableContext>
              <div className="pt-2 text-xs text-muted-foreground">
                Drag grip to reorder • Click X to remove
              </div>
            </DndContext>
          ) : (
            <Badge variant="outline" className="text-xs font-normal">
              No grouping applied
            </Badge>
          )}
        </div>
        {columnsToAddForGrouping.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Add group:</span>
            <Select value="" onValueChange={handleAddGroup}>
              <SelectTrigger className="h-8 text-sm max-w-xs">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <SelectValue placeholder="Select column to group by..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {columnsToAddForGrouping.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Column Visibility & Order Section */}
      <div className="space-y-3">
         <h3 className="text-sm font-medium text-foreground">Visible Columns</h3>
         <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Visible columns (drag to reorder):</span>
          {columnOrder.length > 0 ? (
            <DndContext
              sensors={columnOrderSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleColumnOrderDragEnd}
            >
              <SortableContext items={activeColumnOrderItems} strategy={verticalListSortingStrategy}>
                <div className="flex flex-wrap gap-2">
                  {visibleOrderedColumns.map((columnId) => (
                     <SortableItem 
                      key={columnId} 
                      id={columnId} 
                      label={getColumnLabel(columnId)} 
                      onRemove={handleRemoveColumnFromOrder} 
                      isGrouped={grouping.includes(columnId)} // Pass the isGrouped prop
                    />
                  ))}
                </div>
              </SortableContext>
               <div className="pt-2 text-xs text-muted-foreground">
                Drag grip to reorder • Click X to hide
              </div>
              <div className="pt-1 text-xs text-blue-600">
                Note: Blue items are grouped and always appear first, ordered by group sequence.
              </div>
            </DndContext>
          ) : (
             <Badge variant="outline" className="text-xs font-normal">
              No columns visible
            </Badge>
          )}
        </div>
         {columnsToAddForOrdering.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Show column:</span>
            <Select value="" onValueChange={handleAddColumnToOrder}>
              <SelectTrigger className="h-8 text-sm max-w-xs">
                 <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <SelectValue placeholder="Select column to show..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {columnsToAddForOrdering.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Hook to manage drag-and-drop state and logic for configuration lists (grouping, column order).
 * @param items Current list of item IDs (e.g., column IDs).
 * @param onItemsChange Callback to update the list state.
 * @returns DndContext sensors and handleDragEnd function.
 */
function useConfigurationDnD(
  items: string[], // Generalized from GroupingState
  onItemsChange: (items: string[]) => void // Generalized from onGroupingChange
) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      
      if (over && active.id !== over.id) {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        
        if (oldIndex !== -1 && newIndex !== -1) {
          onItemsChange(arrayMove(items, oldIndex, newIndex))
        }
      }
    },
    [items, onItemsChange] // Updated dependencies
  )

  return { sensors, handleDragEnd }
} 