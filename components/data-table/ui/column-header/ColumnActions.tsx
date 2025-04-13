import * as React from "react";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, EyeOff, X } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SelectFilter } from "@/components/data-table/ui/column-header/filters/SelectFilter";
import { RangeFilter } from "@/components/data-table/ui/column-header/filters/RangeFilter";
import { TextFilter } from "@/components/data-table/ui/column-header/filters/TextFilter";
import { StarRatingFilter } from "@/components/data-table/ui/column-header/filters/StarRatingFilter";
import { RangeSliderFilter } from "@/components/data-table/ui/column-header/filters/RangeSliderFilter";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnFilter } from "@/components/data-table/types";

export const AGGREGATION_FUNCTIONS = [

  { value: "sum", type: "sum", label: "Sum" },  

  { value: "count", type: "numeric", label: "Count" },  
  { value: "uniqueCount", type: "numeric", label: "Unique Count" },  


  { value: "min", type: "standard", label: "Min" },
  { value: "max", type: "standard", label: "Max" },
  { value: "mean", type: "standard", label: "Average" },
  { value: "median", type: "standard", label: "Median" },

  { value: "first", type: "order", label: "First Value" },
  { value: "last", type: "order", label: "Last Value" },
  { value: "extent", type: "order", label: "Range" },

  //{ value: "unique", type: " Numeric", label: "Unique Values" },  
  { value: "sparkline", type: "chart", label: "Histogram" },
];

// Group aggregation functions by type for display
const GROUPED_AGGREGATION_FUNCTIONS = {
  numeric: AGGREGATION_FUNCTIONS.filter(fn => fn.type === "numeric"),
  standard: AGGREGATION_FUNCTIONS.filter(fn => fn.type === "standard"),
  order: AGGREGATION_FUNCTIONS.filter(fn => fn.type === "order"),
  chart: AGGREGATION_FUNCTIONS.filter(fn => fn.type === "chart"),
  sum: AGGREGATION_FUNCTIONS.filter(fn => fn.type === "sum"),
};

// Function to convert type names to display labels
const getGroupLabel = (type: string): string => {
  switch (type) {
    case "numeric": return "Counting";
    case "standard": return "Statistical";
    case "order": return "Ordering";
    case "chart": return "Visualization";
    case "sum": return "Sums";
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

interface ColumnActionsProps<TData, TValue> {
  column: Column<TData, TValue>;
  filterConfig?: ColumnFilter;
  onAggregationChange?: (columnId: string, aggregationFn: string) => void;
}

export function ColumnActions<TData, TValue>({
  column,
  filterConfig,
  onAggregationChange,
}: ColumnActionsProps<TData, TValue>) {
  const isSortable = column.getCanSort();
  const isFilterable = column.getCanFilter();
  const isAggregatable = Boolean(column.columnDef.aggregationFn || onAggregationChange);
  
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
      if (onAggregationChange) {
        onAggregationChange(column.id, value);
      } else {
        // If no callback is provided, still update the column definition directly
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
      case "rangeSlider":
        return <RangeSliderFilter column={column} filter={filterConfig} />;
      case "starRating":
        return <StarRatingFilter column={column} filter={filterConfig} />;
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
    <div className="w-[240px] p-1">
      {isSortable && (
        <DropdownMenuGroup className="mb-1">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground py-1 px-2">Sort Order</DropdownMenuLabel>
          <div className="flex gap-0.5 px-1">
            <DropdownMenuItem 
              onClick={() => column.toggleSorting(false)}
              className="h-8 justify-start py-0.5 px-2 flex-1"
            >
              <ArrowUp className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/70" />
              <span>Asc</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => column.toggleSorting(true)}
              className="h-8 justify-start py-0.5 px-2 flex-1"
            >
              <ArrowDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/70" />
              <span>Desc</span>
            </DropdownMenuItem>
            {column.getIsSorted() && (
              <DropdownMenuItem 
                onClick={() => column.clearSorting()}
                className="h-8 justify-center py-0.5 px-2 flex-1"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground/70" />
              </DropdownMenuItem>
            )}
          </div>
        </DropdownMenuGroup>
      )}
      
      {isFilterable && (
        <>
          {isSortable && <DropdownMenuSeparator className="my-1" />}
          <DropdownMenuGroup className="mb-1">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground py-1 px-2">Filter</DropdownMenuLabel>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()} 
              className="p-1 cursor-default focus:bg-transparent"
            >
              <div className="w-full" onClick={preventClose}>
                {renderFilter()}
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </>
      )}
      
      {isAggregatable && (
        <>
          {(isSortable || isFilterable) && <DropdownMenuSeparator className="my-1" />}
          <DropdownMenuGroup className="mb-1">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground py-1 px-2">Aggregation</DropdownMenuLabel>
            <DropdownMenuItem 
              onSelect={(e) => e.preventDefault()} 
              className="p-1 cursor-default focus:bg-transparent"
            >
              <div className="w-full" onClick={preventClose}>
                <Select
                  value={selectedAggFn}
                  onValueChange={handleAggregationChange}
                >
                  <SelectTrigger className="w-full h-8 min-h-8 text-sm">
                    <SelectValue placeholder="First Value" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GROUPED_AGGREGATION_FUNCTIONS).map(([type, functions]) => (
                      <SelectGroup key={type}>
                        <SelectLabel>{getGroupLabel(type)}</SelectLabel>
                        {functions.map((aggFn) => (
                          <SelectItem key={aggFn.value} value={aggFn.value}>
                            {aggFn.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </>
      )}
      
      {/* Hide option */}
      {(isSortable || isFilterable || isAggregatable) && <DropdownMenuSeparator className="my-1" />}
      <DropdownMenuItem 
        onClick={() => column.toggleVisibility(false)}
        className="h-8 justify-start py-0.5 px-2"
      >
        <EyeOff className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/70" />
        <span>Hide</span>
      </DropdownMenuItem>
    </div>
  );
}
