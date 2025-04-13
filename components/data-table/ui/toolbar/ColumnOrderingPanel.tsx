/**
 * Column ordering panel component that enables drag-and-drop reordering of table columns.
 * Provides a visual interface for changing column order with real-time preview
 * and persistent state management for column positioning.
 */

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
import { Button } from "@/components/ui/button";
import { GripVertical, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ColumnOrderItem {
  id: string;
  label: string;
}

interface SortableColumnItemProps {
  column: ColumnOrderItem;
}

// Sortable Item component for column ordering
const SortableColumnItem = ({ column }: SortableColumnItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:bg-accent/50 mb-2"
    >
      <span {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </span>
      <span className="text-sm">{column.label}</span>
    </div>
  );
};

export interface ColumnOrderingPanelProps {
  columns: { id: string; label: string }[];
  columnOrder: string[];
  onColumnOrderChange: (updater: React.SetStateAction<string[]>) => void;
}

export function ColumnOrderingPanel({
  columns,
  columnOrder,
  onColumnOrderChange,
}: ColumnOrderingPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keep a local copy of orderedColumns that's derived from props but doesn't
  // directly update the parent state until drag ends
  const [localOrderedColumns, setLocalOrderedColumns] = React.useState<ColumnOrderItem[]>([]);
  
  // Initialize the ordered columns based on columnOrder state and available columns
  React.useEffect(() => {
    // Create a map of all columns
    const columnsMap = new Map(columns.map(c => [c.id, c]));
    
    // First include columns that are in columnOrder
    const ordered: ColumnOrderItem[] = columnOrder
      .filter(id => columnsMap.has(id))
      .map(id => columnsMap.get(id)!)
      .map(c => ({ id: c.id, label: c.label }));
    
    // Then add any remaining columns that are not in columnOrder
    columns.forEach(column => {
      if (!columnOrder.includes(column.id)) {
        ordered.push({ id: column.id, label: column.label });
      }
    });
    
    setLocalOrderedColumns(ordered);
  }, [columns, columnOrder]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localOrderedColumns.findIndex(col => col.id === active.id);
      const newIndex = localOrderedColumns.findIndex(col => col.id === over.id);

      // First update local state for immediate visual feedback
      const newLocalOrderedColumns = arrayMove(localOrderedColumns, oldIndex, newIndex);
      setLocalOrderedColumns(newLocalOrderedColumns);
      
      // Then propagate the change to parent component
      onColumnOrderChange(newLocalOrderedColumns.map(col => col.id));
    }
  };

  // Reset to default ordering
  const resetColumnOrder = () => {
    // Clear local state
    const defaultOrder = columns.map(col => ({ id: col.id, label: col.label }));
    setLocalOrderedColumns(defaultOrder);
    
    // Propagate to parent
    onColumnOrderChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium">Drag to reorder columns</span>
        <Button
          variant="outline"
          size="sm"
          onClick={resetColumnOrder}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Order
        </Button>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localOrderedColumns.map(col => col.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {localOrderedColumns.map(column => (
                <SortableColumnItem key={column.id} column={column} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>

      <div className="pt-2 text-xs text-muted-foreground">
        <p>Drag columns to reorder • Click Reset to restore default order</p>
      </div>
    </div>
  );
} 