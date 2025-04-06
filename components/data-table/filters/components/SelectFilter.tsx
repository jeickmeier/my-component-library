"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelectFilter } from "../../types"

interface SelectFilterProps<TData> {
  column: Column<TData, unknown>
  filter: SelectFilter
}

export function SelectFilterComponent<TData>({
  column,
  filter,
}: SelectFilterProps<TData>) {
  const filterValue = column.getFilterValue() as string

  return (
    <Select
      value={filterValue || "_all"}
      onValueChange={(value) => {
        column.setFilterValue(value === "_all" ? undefined : value)
      }}
    >
      <SelectTrigger className="h-8 w-full">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_all">All</SelectItem>
        {filter.options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 