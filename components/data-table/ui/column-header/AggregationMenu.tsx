import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Calculator } from "lucide-react"
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Available aggregation functions
export const AGGREGATION_FUNCTIONS = [
  { value: "sum", label: "Sum" },
  { value: "count", label: "Count" },
  { value: "min", label: "Min" },
  { value: "max", label: "Max" },
  { value: "mean", label: "Average" },
  { value: "median", label: "Median" },
  { value: "unique", label: "Unique Values" },
  { value: "uniqueCount", label: "Unique Count" },
  { value: "first", label: "First Value" },
]

interface AggregationMenuProps<TData, TValue> {
  column: Column<TData, TValue>
  onAggregationChange?: (columnId: string, aggregationFn: string) => void
}

export function AggregationMenu<TData, TValue>({
  column,
  onAggregationChange,
}: AggregationMenuProps<TData, TValue>) {
  // Get the current aggregation function name
  const getCurrentAggregationFn = React.useCallback(() => {
    const aggFn = column.columnDef.aggregationFn;
    if (!aggFn) return "sum"; // Default
    
    return typeof aggFn === "string" ? aggFn : "custom";
  }, [column.columnDef.aggregationFn]);
  
  // For state tracking in the UI
  const [selectedAggFn, setSelectedAggFn] = React.useState(() => getCurrentAggregationFn());
  
  // Update selected aggregation function when column def changes
  React.useEffect(() => {
    setSelectedAggFn(getCurrentAggregationFn());
  }, [column.columnDef.aggregationFn, getCurrentAggregationFn]);
  
  // Handle aggregation function change
  const handleAggregationChange = React.useCallback((value: string) => {
    // Update the local state first
    setSelectedAggFn(value);
    
    // Store a reference to the column
    const columnRef = column;
    
    // First, ensure the parent is notified BEFORE modifying the columnDef
    // This ensures the parent has a chance to handle table-level updates
    if (onAggregationChange) {
      onAggregationChange(columnRef.id, value);
    }
    
    // Now update the column definition to ensure changes are applied
    if (columnRef.columnDef) {
      // Need to type cast here because the TS definitions expect specific types
      // but TanStack Table accepts string values for standard aggregation functions
      // @ts-expect-error - The type system doesn't allow direct string assignment to aggregationFn
      columnRef.columnDef.aggregationFn = value;
    }
    
    // Force a column rerender by toggling a state if needed
    // This helps ensure the column recalculates with the new aggregation function
    setTimeout(() => {
      // This timeout helps ensure the update is processed in the next event loop
      columnRef.toggleVisibility();
      columnRef.toggleVisibility();
    }, 0);
  }, [column, onAggregationChange]);
  
  // Prevent re-renders unless necessary
  const stableHandleAggregationChange = React.useCallback((value: string) => {
    if (value !== selectedAggFn) {
      handleAggregationChange(value);
    }
  }, [handleAggregationChange, selectedAggFn]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Calculator className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Aggregation
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="p-2 min-w-[220px]">
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium">Aggregation Function</div>
              <Select
                value={selectedAggFn}
                onValueChange={stableHandleAggregationChange}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select function" />
                </SelectTrigger>
                <SelectContent>
                  {AGGREGATION_FUNCTIONS.map((aggFn) => (
                    <SelectItem key={aggFn.value} value={aggFn.value}>
                      {aggFn.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Display current aggregation function */}
            <div className="text-xs text-muted-foreground">
              Current: {AGGREGATION_FUNCTIONS.find(af => af.value === selectedAggFn)?.label || selectedAggFn}
            </div>
          </div>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
} 