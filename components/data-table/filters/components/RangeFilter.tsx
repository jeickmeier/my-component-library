"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { RangeFilter } from "../../types"

interface RangeFilterProps<TData> {
  column: Column<TData, unknown>
  filter: RangeFilter
}

export function RangeFilterComponent<TData>({
  column,
}: RangeFilterProps<TData>) {
  const filterValue = column.getFilterValue() as [number | undefined, number | undefined]
  const [min, setMin] = React.useState<string>(filterValue?.[0] !== undefined ? String(filterValue[0]) : "")
  const [max, setMax] = React.useState<string>(filterValue?.[1] !== undefined ? String(filterValue[1]) : "")

  // Handle when filter value changes externally
  React.useEffect(() => {
    if (filterValue) {
      setMin(filterValue[0] !== undefined ? String(filterValue[0]) : "")
      setMax(filterValue[1] !== undefined ? String(filterValue[1]) : "")
    } else {
      setMin("")
      setMax("")
    }
  }, [filterValue])

  // Apply range filter when min or max changes
  const handleRangeFilter = React.useCallback(() => {
    const minVal = min ? Number(min) : undefined
    const maxVal = max ? Number(max) : undefined
    
    column.setFilterValue(
      minVal !== undefined || maxVal !== undefined 
        ? [minVal, maxVal] 
        : undefined
    )
  }, [min, max, column])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          className="h-8"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onBlur={handleRangeFilter}
          onKeyDown={(e) => e.key === 'Enter' && handleRangeFilter()}
        />
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Max"
          className="h-8"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onBlur={handleRangeFilter}
          onKeyDown={(e) => e.key === 'Enter' && handleRangeFilter()}
        />
      </div>
    </div>
  )
} 