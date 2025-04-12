import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { RangeColumnFilter } from "@/components/data-table/types";

interface RangeFilterProps<TData> {
  column: Column<TData, unknown>;
  filter: RangeColumnFilter;
}

export function RangeFilter<TData>({
  column,
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

  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">{filter.label}:</p>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          placeholder={`Min ${filter.label}`}
          className="h-8 w-24"
          value={minValue}
          onChange={(event) => {
            const newMinValue = event.target.value;
            setMinValue(newMinValue);
            updateFilterValue(newMinValue, maxValue);
          }}
        />
        <span>-</span>
        <Input
          type="number"
          placeholder={`Max ${filter.label}`}
          className="h-8 w-24"
          value={maxValue}
          onChange={(event) => {
            const newMaxValue = event.target.value;
            setMaxValue(newMaxValue);
            updateFilterValue(minValue, newMaxValue);
          }}
        />
      </div>
    </div>
  );
}
