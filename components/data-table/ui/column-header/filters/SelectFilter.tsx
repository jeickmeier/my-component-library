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

interface SelectFilterProps<TData> {
  column: Column<TData, unknown>;
  filter: SelectColumnFilter;
}

export function SelectFilter<TData>({
  column,
  filter,
}: SelectFilterProps<TData>) {
  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">{filter.label}:</p>
      <Select
        value={(column.getFilterValue() as string) || "all"}
        onValueChange={(value) => {
          column.setFilterValue(value === "all" ? undefined : value);
        }}
      >
        <SelectTrigger className="h-8 w-36">
          <SelectValue placeholder={`All ${filter.label}`} />
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
    </div>
  );
}
