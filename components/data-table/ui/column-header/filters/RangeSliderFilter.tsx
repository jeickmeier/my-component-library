/**
 * Range slider filter component that provides a visual slider interface for range selection.
 * Implements a dual-thumb slider for min/max value selection with real-time updates
 * and support for custom step sizes and value formatting.
 */

import * as React from "react";
import { Column, Row } from "@tanstack/react-table";
import { Slider } from "@/components/ui/slider";
import { RangeColumnFilter, RangeSliderColumnFilter } from "@/components/data-table/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RangeSliderFilterProps<TData> {
  column: Column<TData, unknown>;
  filter: RangeColumnFilter | RangeSliderColumnFilter;
}

export function RangeSliderFilter<TData>({
  column,
  filter,
}: RangeSliderFilterProps<TData>) {
  // Get column values to determine min and max
  const columnValues = React.useMemo(() => {
    const values: number[] = [];
    const table = column.getFacetedRowModel();
    
    table.rows.forEach((row: Row<TData>) => {
      const value = row.getValue(column.id) as number;
      if (typeof value === 'number' && !isNaN(value)) {
        values.push(value);
      }
    });
    
    return values;
  }, [column]);
  
  // Calculate min and max from filter props or column values
  const minPossible = React.useMemo(() => 
    filter.min !== undefined ? filter.min : Math.min(...columnValues, 0),
  [filter.min, columnValues]);
  
  const maxPossible = React.useMemo(() => 
    filter.max !== undefined ? filter.max : Math.max(...columnValues, 100),
  [filter.max, columnValues]);
  
  // Get step from filter props if available (for RangeSliderColumnFilter)
  const step = React.useMemo(() => 
    'step' in filter && filter.step !== undefined ? filter.step : 1,
  [filter]);

  // Get the current filter value directly from the column
  const currentFilterValue = column.getFilterValue() as
    | [number, number]
    | undefined;

  // Local state for the slider values
  const [range, setRange] = React.useState<[number, number]>([
    minPossible,
    maxPossible,
  ]);

  // Initialize local state from column filter value
  React.useEffect(() => {
    if (currentFilterValue === undefined) {
      setRange([minPossible, maxPossible]);
    } else {
      const min = currentFilterValue[0] ?? minPossible;
      const max = currentFilterValue[1] ?? maxPossible;
      setRange([min, max]);
    }
  }, [currentFilterValue, minPossible, maxPossible]);

  // Update the filter value
  const updateFilterValue = React.useCallback(
    (newRange: [number, number]) => {
      // Only set the filter if the range is different from min/max possible values
      const isDefaultRange = 
        newRange[0] === minPossible && newRange[1] === maxPossible;
      
      column.setFilterValue(isDefaultRange ? undefined : newRange);
    },
    [column, minPossible, maxPossible],
  );

  const clearFilter = React.useCallback(() => {
    setRange([minPossible, maxPossible]);
    column.setFilterValue(undefined);
  }, [column, minPossible, maxPossible]);

  const hasFilter = range[0] !== minPossible || range[1] !== maxPossible;
  
  // Format numbers with commas for better readability
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="w-full px-1 py-2">
      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatNumber(range[0])}</span>
        <span>{formatNumber(range[1])}</span>
      </div>
      
      <Slider
        min={minPossible}
        max={maxPossible}
        step={step}
        value={range}
        onValueChange={(newRange) => {
          setRange(newRange as [number, number]);
        }}
        onValueCommit={(newRange) => {
          updateFilterValue(newRange as [number, number]);
        }}
        className="w-full"
      />
      
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-full mt-2 text-xs p-0 opacity-70 hover:opacity-100"
          onClick={clearFilter}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
} 