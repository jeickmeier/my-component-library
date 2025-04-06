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
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GroupingState } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Plus, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GroupableColumn } from "../types"

/**
 * Props for the SortableItem component
 */
interface SortableItemProps {
  /** Unique identifier for the group */
  id: string
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 bg-accent text-accent-foreground rounded-md px-2 py-1"
    >
      <span {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4" />
      </span>
      <span className="text-sm">{label}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-4 w-4 p-0 ml-1 hover:bg-muted"
        onClick={() => onRemove(id)}
      >
        <X className="h-3 w-3" />
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = grouping.indexOf(active.id as string)
      const newIndex = grouping.indexOf(over.id as string)
      
      onGroupingChange(arrayMove(grouping, oldIndex, newIndex))
    }
  }

  const handleRemoveGroup = (columnId: string) => {
    onGroupingChange(grouping.filter(g => g !== columnId))
  }

  const handleAddGroup = (columnId: string) => {
    if (columnId && !grouping.includes(columnId)) {
      onGroupingChange([...grouping, columnId])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Active groups:</span>
        {grouping.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={grouping} strategy={verticalListSortingStrategy}>
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
          <Badge variant="outline" className="text-muted-foreground">
            No grouping applied
          </Badge>
        )}
      </div>
      {availableColumns.length > grouping.length && (
        <div className="flex items-center gap-2">
          <span className="text-sm">Add group:</span>
          <Select
            value=""
            onValueChange={handleAddGroup}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <div className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" />
                <SelectValue placeholder="Add column..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {availableColumns
                .filter(column => !grouping.includes(column.id))
                .map(column => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="pt-4 text-xs text-muted-foreground">
        <p>Drag groups to reorder • Click X to remove a group</p>
      </div>
    </div>
  )
} 