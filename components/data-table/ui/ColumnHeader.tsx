import * as React from "react"
import { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff, Filter, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelectColumnFilter, RangeColumnFilter } from "@/components/data-table/types"

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: React.ReactNode
  filterConfig?: SelectColumnFilter | RangeColumnFilter
  onAggregationChange?: (columnId: string, aggregationFn: string) => void
}

// Available aggregation functions
const AGGREGATION_FUNCTIONS = [
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

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  filterConfig,
  onAggregationChange,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const isSortable = column.getCanSort();
  const isFilterable = column.getCanFilter();
  
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
    
    // Directly update the column definition to ensure changes are applied
    if (column.columnDef) {
      // Need to type cast here because the TS definitions expect specific types
      // but TanStack Table accepts string values for standard aggregation functions
      // @ts-expect-error - The type system doesn't allow direct string assignment to aggregationFn
      column.columnDef.aggregationFn = value;
      
      // Notify parent component for table-level updates
      if (onAggregationChange) {
        onAggregationChange(column.id, value);
      }
    }
  }, [column, onAggregationChange]);
  
  // Prevent re-renders unless necessary
  const stableHandleAggregationChange = React.useCallback((value: string) => {
    if (value !== selectedAggFn) {
      handleAggregationChange(value);
    }
  }, [handleAggregationChange, selectedAggFn]);
  
  if (!isSortable) {
    return (
      <div className="h-full flex items-center px-2 p-0 m-0 cursor-default">
        <div className="flex-1 truncate">
          {title}
        </div>
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-full p-0 m-0 font-normal rounded-none flex items-center justify-between data-[state=open]:bg-accent hover:bg-accent/50"
        >
          <div className="flex items-center w-full h-full px-2">
            <div className="flex-1 truncate text-left">
              {title}
            </div>
            <div className="ml-2 flex aspect-square items-center justify-center">
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5" />
              )}
              {column.getIsFiltered() && (
                <Filter className="h-3.5 w-3.5 ml-1" />
              )}
            </div>
          </div>
          <span className="sr-only">Sort by {column.id}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
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
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Filter
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="p-2 min-w-[220px]">
                  <div className="space-y-2">
                    {filterConfig?.type === 'select' ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-medium">{filterConfig.label}</div>
                        <Select
                          value={(column.getFilterValue() as string) || "all"}
                          onValueChange={(value) => {
                            column.setFilterValue(value === "all" ? undefined : value)
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder={`All ${filterConfig.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {filterConfig.options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : filterConfig?.type === 'range' ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-medium">{filterConfig.label}</div>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            placeholder={`Min`}
                            className="h-8"
                            value={(column.getFilterValue() as [number, number])?.[0] ?? ""}
                            onChange={(event) => {
                              const value = event.target.value ? Number(event.target.value) : undefined;
                              const maxValue = (column.getFilterValue() as [number, number])?.[1];
                              
                              column.setFilterValue(
                                value !== undefined || maxValue !== undefined 
                                  ? [value, maxValue] 
                                  : undefined
                              );
                            }}
                          />
                          <span>-</span>
                          <Input
                            type="number"
                            placeholder={`Max`}
                            className="h-8"
                            value={(column.getFilterValue() as [number, number])?.[1] ?? ""}
                            onChange={(event) => {
                              const value = event.target.value ? Number(event.target.value) : undefined;
                              const minValue = (column.getFilterValue() as [number, number])?.[0];
                              
                              column.setFilterValue(
                                minValue !== undefined || value !== undefined 
                                  ? [minValue, value] 
                                  : undefined
                              );
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-medium">Filter value</div>
                        <Input
                          placeholder="Filter value..."
                          value={(column.getFilterValue() as string) ?? ""}
                          onChange={(e) => column.setFilterValue(e.target.value)}
                          className="h-8"
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => column.setFilterValue(undefined)}
                        className="h-7 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Hide
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 