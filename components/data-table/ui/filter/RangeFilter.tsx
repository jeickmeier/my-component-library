import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { RangeColumnFilter } from "@/components/data-table/types"

interface RangeFilterProps<TData> {
  column: Column<TData, unknown>
  filter: RangeColumnFilter
}

export function RangeFilter<TData>({
  column,
  filter,
}: RangeFilterProps<TData>) {
  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">
        {filter.label}:
      </p>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          placeholder={`Min ${filter.label}`}
          className="h-8 w-24"
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
          placeholder={`Max ${filter.label}`}
          className="h-8 w-24"
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
  )
} 