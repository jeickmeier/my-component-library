"use client"

/**
 * Grouping Panel Module
 * 
 * This module provides components for managing table row grouping through a user interface.
 * It includes a draggable list of active groups and controls for adding/removing groups.
 * 
 * Features:
 * - Drag-and-drop group reordering
 * - Visual group management
 * - Group addition/removal
 * - Keyboard accessibility
 * - Responsive design
 * 
 * @module data-table/parts/grouping-panel
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
import type { GroupingState } from "@tanstack/react-table"
import { GripVertical, Plus, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GroupableColumn } from "../types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

/**
 * Props for the SortableItem component
 */
interface SortableItemProps {
  /** Unique identifier for the group */
  id: UniqueIdentifier
  /** Display label for the group */
  label: string
  /** Callback function when the group is removed */
  onRemove: (id: string) => void
}

/**
 * Sortable Item Component
 * 
 * A draggable item representing a group in the grouping panel. It includes a drag handle,
 * label, and remove button.
 * 
 * @param props Component properties
 * @param props.id Unique identifier for the group
 * @param props.label Display label for the group
 * @param props.onRemove Callback function when the group is removed
 */
const SortableItem = ({ id, label, onRemove }: SortableItemProps) => {
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
      className="flex h-7 items-center gap-1 rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1"
        aria-label={`Drag ${label}`}
      >
        <GripVertical className="h-4 w-4" />
      </span>
      <span className="select-none">{label}</span>
      <Button
        variant="ghost"
        size="icon"
        className="ml-1 h-6 w-6 hover:bg-muted"
        onClick={handleRemove}
        aria-label={`Remove ${label} group`}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

/**
 * Props for the GroupingPanel component
 */
interface GroupingPanelProps {
  /** List of columns that can be used for grouping */
  availableColumns: GroupableColumn[]
  /** Current grouping state */
  grouping: GroupingState
  /** Callback function when grouping changes */
  onGroupingChange: (grouping: GroupingState) => void
}

/**
 * Grouping Panel Component
 * 
 * A panel component that provides a user interface for managing table row grouping.
 * It allows users to add, remove, and reorder groups through a drag-and-drop interface.
 * 
 * Features:
 * - Visual representation of active groups
 * - Drag-and-drop reordering
 * - Add/remove group controls
 * - Keyboard accessibility
 * - Responsive design
 * 
 * @param props Component properties
 * @param props.availableColumns List of columns that can be used for grouping
 * @param props.grouping Current grouping state
 * @param props.onGroupingChange Callback function when grouping changes
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <GroupingPanel
 *   availableColumns={columns}
 *   grouping={grouping}
 *   onGroupingChange={setGrouping}
 * />
 * ```
 */
export function GroupingPanel({ 
  availableColumns, 
  grouping, 
  onGroupingChange 
}: GroupingPanelProps) {
  const { sensors, handleDragEnd } = useGroupingDnD(grouping, onGroupingChange)
  const activeGroupItems = React.useMemo(() => grouping.map(id => ({ id })), [grouping])

  const handleRemoveGroup = React.useCallback((columnId: string) => {
    onGroupingChange(grouping.filter((g) => g !== columnId))
  }, [grouping, onGroupingChange])

  const handleAddGroup = React.useCallback((columnId: string) => {
    if (columnId && !grouping.includes(columnId)) {
      onGroupingChange([...grouping, columnId])
    }
  }, [grouping, onGroupingChange])

  const columnsToAdd = React.useMemo(() => 
    availableColumns.filter(column => !grouping.includes(column.id)),
    [availableColumns, grouping]
  )

  return (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Active groups (drag to reorder):</span>
        {grouping.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={activeGroupItems} strategy={verticalListSortingStrategy}>
              <div className="flex flex-wrap gap-2">
                {grouping.map((columnId) => {
                  const column = availableColumns.find(col => col.id === columnId)
                  return column ? (
                    <SortableItem 
                      key={columnId} 
                      id={columnId} 
                      label={column.label} 
                      onRemove={handleRemoveGroup} 
                    />
                  ) : null
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <Badge variant="outline" className="text-xs font-normal">
            No grouping applied
          </Badge>
        )}
      </div>
      {columnsToAdd.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Add group:</span>
          <Select value="" onValueChange={handleAddGroup}>
            <SelectTrigger className="h-8 w-full sm:w-[200px] text-sm">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <SelectValue placeholder="Select column..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {columnsToAdd.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {grouping.length > 0 && (
        <div className="pt-2 text-xs text-muted-foreground">
          Drag grip to reorder • Click X to remove
        </div>
      )}
    </div>
  )
}

/**
 * Hook to manage drag-and-drop state and logic for the grouping panel.
 * @param grouping Current grouping state (array of column IDs).
 * @param onGroupingChange Callback to update the grouping state.
 * @returns DndContext sensors and handleDragEnd function.
 */
function useGroupingDnD(
  grouping: GroupingState,
  onGroupingChange: (grouping: GroupingState) => void
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
        const oldIndex = grouping.indexOf(active.id as string)
        const newIndex = grouping.indexOf(over.id as string)
        
        if (oldIndex !== -1 && newIndex !== -1) {
          onGroupingChange(arrayMove(grouping, oldIndex, newIndex))
        }
      }
    },
    [grouping, onGroupingChange]
  )

  return { sensors, handleDragEnd }
} 