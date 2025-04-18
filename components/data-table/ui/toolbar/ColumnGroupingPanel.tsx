"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GroupingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupableColumn {
  id: string;
  label: string;
}

interface SortableItemProps {
  id: string;
  label: string;
  onRemove: (id: string) => void;
}

// Sortable Item component for group by
const SortableItem = ({ id, label, onRemove }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
  );
};

interface GroupingPanelProps {
  availableColumns: GroupableColumn[];
  grouping: GroupingState;
  onGroupingChange: (grouping: GroupingState) => void;
}

// Memoize GroupingPanel to prevent rerendering on aggregation changes
export const GroupingPanel = function GroupingPanel({
  availableColumns,
  grouping,
  onGroupingChange,
}: GroupingPanelProps) {
  // Local state to ensure immediate UI updates
  const [localGrouping, setLocalGrouping] = React.useState<string[]>(grouping);
  const [selectValue, setSelectValue] = React.useState("");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Keep local state in sync with props
  React.useEffect(() => {
    setLocalGrouping(grouping);
  }, [grouping]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localGrouping.indexOf(active.id as string);
      const newIndex = localGrouping.indexOf(over.id as string);

      const newGrouping = arrayMove(localGrouping, oldIndex, newIndex);
      setLocalGrouping(newGrouping);
      onGroupingChange(newGrouping);
    }
  };

  const handleRemoveGroup = (columnId: string) => {
    const newGrouping = localGrouping.filter((g) => g !== columnId);
    setLocalGrouping(newGrouping);
    onGroupingChange(newGrouping);
  };

  const handleAddGroup = (columnId: string) => {
    if (columnId && !localGrouping.includes(columnId)) {
      const newGrouping = [...localGrouping, columnId];
      setLocalGrouping(newGrouping);
      onGroupingChange(newGrouping);
      setSelectValue(""); // Reset select value after adding
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Active groups:</span>
        {localGrouping.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localGrouping}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2">
                {localGrouping.map((columnId) => {
                  const column = availableColumns.find(
                    (col) => col.id === columnId,
                  );
                  return column ? (
                    <SortableItem
                      key={columnId}
                      id={columnId}
                      label={column.label}
                      onRemove={handleRemoveGroup}
                    />
                  ) : null;
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
      {availableColumns.length > localGrouping.length && (
        <div className="flex items-center gap-2">
          <span className="text-sm">Add group:</span>
          <Select value={selectValue} onValueChange={handleAddGroup}>
            <SelectTrigger className="h-8 w-[180px]">
              <div className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" />
                <SelectValue placeholder="Add column..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {availableColumns
                .filter((column) => !localGrouping.includes(column.id))
                .map((column) => (
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
  );
};
