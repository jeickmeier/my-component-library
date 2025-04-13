/**
 * Range filter component that allows filtering numeric values within a specified range.
 * Provides min/max input fields with validation and proper numeric handling,
 * supporting both inclusive minimum and maximum value filtering.
 */

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { RangeColumnFilter } from "@/components/data-table/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RangeFilterProps<TData> {
  column: Column<TData, unknown>;
  filter: RangeColumnFilter;
}

export function RangeFilter<TData>({
  column,
  // We're not using the filter parameter anymore, but keep it in the interface for consistency
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter,
}: RangeFilterProps<TData>) {
  const [minValue, setMinValue] = React.useState<string>("");
  const [maxValue, setMaxValue] = React.useState<string>("");

  // Get the current filter value directly from the column
  const currentFilterValue = column.getFilterValue() as
    | [number, number]
    | undefined;

  // Initialize local state from column filter value
  React.useEffect(() => {
    if (currentFilterValue === undefined) {
      setMinValue("");
      setMaxValue("");
    } else {
      setMinValue(currentFilterValue[0]?.toString() || "");
      setMaxValue(currentFilterValue[1]?.toString() || "");
    }
  }, [currentFilterValue]);

  // Update the filter with debounce
  const updateFilterValue = React.useCallback(
    (min: string | undefined, max: string | undefined) => {
      const minNum = min ? Number(min) : undefined;
      const maxNum = max ? Number(max) : undefined;

      column.setFilterValue(
        minNum !== undefined || maxNum !== undefined
          ? [minNum, maxNum]
          : undefined,
      );
    },
    [column],
  );

  const clearFilter = React.useCallback(() => {
    setMinValue("");
    setMaxValue("");
    column.setFilterValue(undefined);
  }, [column]);

  const hasValue = minValue !== "" || maxValue !== "";

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-1.5 w-full">
        <div className="relative w-full">
          <Input
            type="number"
            placeholder="Min"
            className="h-8 min-h-8 text-sm w-full"
            value={minValue}
            onChange={(event) => {
              const newMinValue = event.target.value;
              setMinValue(newMinValue);
              updateFilterValue(newMinValue, maxValue);
            }}
          />
        </div>
        <div className="relative w-full">
          <Input
            type="number"
            placeholder="Max"
            className="h-8 min-h-8 text-sm w-full"
            value={maxValue}
            onChange={(event) => {
              const newMaxValue = event.target.value;
              setMaxValue(newMaxValue);
              updateFilterValue(minValue, newMaxValue);
            }}
          />
        </div>
      </div>
      {hasValue && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-full mt-1 text-xs p-0 opacity-70 hover:opacity-100"
          onClick={clearFilter}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
