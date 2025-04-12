import * as React from "react";
import { Column } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectColumnFilter } from "@/components/data-table/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectFilterProps<TData> {
  column: Column<TData, unknown>;
  filter: SelectColumnFilter;
}

export function SelectFilter<TData>({
  column,
  filter,
}: SelectFilterProps<TData>) {
  const currentValue = (column.getFilterValue() as string) || "all";
  
  const clearFilter = React.useCallback(() => {
    column.setFilterValue(undefined);
  }, [column]);

  return (
    <div className="relative w-full">
      <Select
        value={currentValue}
        onValueChange={(value) => {
          column.setFilterValue(value === "all" ? undefined : value);
        }}
      >
        <SelectTrigger className="h-8 min-h-8 w-full text-sm pr-7">
          <SelectValue placeholder={`All`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {filter.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentValue !== "all" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 absolute right-7 top-1 p-0 opacity-70 hover:opacity-100"
          onClick={clearFilter}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Clear filter</span>
        </Button>
      )}
    </div>
  );
}
