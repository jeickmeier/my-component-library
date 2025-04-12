import * as React from "react";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, EyeOff, Filter, Calculator } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SelectFilter } from "./filters/SelectFilter";
import { RangeFilter } from "./filters/RangeFilter";
import { TextFilter } from "./filters/TextFilter";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectColumnFilter, RangeColumnFilter } from "../../types";
import { AGGREGATION_FUNCTIONS } from "./AggregationMenu";

interface ColumnActionsProps<TData, TValue> {
  column: Column<TData, TValue>;
  filterConfig?: SelectColumnFilter | RangeColumnFilter;
  onAggregationChange?: (columnId: string, aggregationFn: string) => void;
}

export function ColumnActions<TData, TValue>({
  column,
  filterConfig,
  onAggregationChange,
}: ColumnActionsProps<TData, TValue>) {
  const isFilterable = column.getCanFilter();
  
  // Aggregation state management (moved from AggregationMenu)
  const getCurrentAggregationFn = React.useCallback(() => {
    const aggFn = column.columnDef.aggregationFn;
    if (!aggFn) return "sum"; // Default
    return typeof aggFn === "string" ? aggFn : "custom";
  }, [column.columnDef.aggregationFn]);

  const [selectedAggFn, setSelectedAggFn] = React.useState(() =>
    getCurrentAggregationFn(),
  );

  const prevAggFnRef = React.useRef(selectedAggFn);
  React.useEffect(() => {
    const currentAggFn = getCurrentAggregationFn();
    if (prevAggFnRef.current !== currentAggFn) {
      prevAggFnRef.current = currentAggFn;
      setSelectedAggFn(currentAggFn);
    }
  }, [getCurrentAggregationFn]);

  const handleAggregationChange = React.useCallback(
    (value: string) => {
      if (value === selectedAggFn) return;
      
      // Update the local state first
      setSelectedAggFn(value);
      prevAggFnRef.current = value;
      
      // Call the parent callback to handle the aggregation change
      // This will trigger the proper table update through the handleAggregationChange function in Structure.tsx
      if (onAggregationChange) {
        onAggregationChange(column.id, value);
      } else {
        // If no callback is provided, still update the column definition directly
        // Although this likely won't trigger a table recalculation
        if (column.columnDef) {
          // @ts-expect-error - Type system constraints
          column.columnDef.aggregationFn = value;
        }
      }
    },
    [column, onAggregationChange, selectedAggFn],
  );

  // Render the appropriate filter based on the filter type
  const renderFilter = () => {
    if (!filterConfig) {
      return <TextFilter column={column} />;
    }

    switch (filterConfig.type) {
      case "select":
        return <SelectFilter column={column} filter={filterConfig} />;
      case "range":
        return <RangeFilter column={column} filter={filterConfig} />;
      default:
        return <TextFilter column={column} />;
    }
  };

  // Prevent dropdown from closing when clicking on interactive elements
  const preventClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
        <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Asc
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
        <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Desc
      </DropdownMenuItem>
      
      {isFilterable && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onSelect={(e) => e.preventDefault()} 
            className="p-2 cursor-default"
          >
            <div className="flex items-center" onClick={preventClose}>
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              <div className="flex-1">{renderFilter()}</div>
            </div>
          </DropdownMenuItem>
        </>
      )}
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem 
        onSelect={(e) => e.preventDefault()} 
        className="p-2 cursor-default"
      >
        <div className="flex flex-col space-y-2 w-full" onClick={preventClose}>
          <div className="flex items-center">
            <Calculator className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            <div className="text-xs font-medium">Aggregation</div>
          </div>
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
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
        <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Hide
      </DropdownMenuItem>
    </>
  );
}
