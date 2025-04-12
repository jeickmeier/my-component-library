import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Calculator } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
];

interface AggregationMenuProps<TData, TValue> {
  column: Column<TData, TValue>;
  onAggregationChange?: (columnId: string, aggregationFn: string) => void;
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
  const [selectedAggFn, setSelectedAggFn] = React.useState(() =>
    getCurrentAggregationFn(),
  );

  // Update selected aggregation function when column def changes
  // Use a ref to track previous value to avoid unnecessary updates
  const prevAggFnRef = React.useRef(selectedAggFn);
  React.useEffect(() => {
    const currentAggFn = getCurrentAggregationFn();
    if (prevAggFnRef.current !== currentAggFn) {
      prevAggFnRef.current = currentAggFn;
      setSelectedAggFn(currentAggFn);
    }
  }, [getCurrentAggregationFn]);

  // Handle aggregation function change with debouncing to prevent update loops
  const handleAggregationChange = React.useCallback(
    (value: string) => {
      if (value === selectedAggFn) return; // Avoid redundant updates

      // Update the local state first
      setSelectedAggFn(value);
      prevAggFnRef.current = value; // Update ref to prevent useEffect from firing again

      // Notify parent about the change
      if (onAggregationChange) {
        onAggregationChange(column.id, value);
      }

      // Update column definition without forcing a re-render
      if (column.columnDef) {
        // @ts-expect-error - Type system constraints
        column.columnDef.aggregationFn = value;
      }
    },
    [column, onAggregationChange, selectedAggFn],
  );

  // No need for stableHandleAggregationChange since we already check value equality

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
                onValueChange={handleAggregationChange}
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
              Current:{" "}
              {AGGREGATION_FUNCTIONS.find((af) => af.value === selectedAggFn)
                ?.label || selectedAggFn}
            </div>
          </div>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
