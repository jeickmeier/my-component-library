"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiSelectFilter } from "../../types"

interface MultiSelectFilterProps<TData> {
  column: Column<TData, unknown>
  filter: MultiSelectFilter
}

export function MultiSelectFilterComponent<TData>({
  column,
  filter,
}: MultiSelectFilterProps<TData>) {
  const filterValue = column.getFilterValue() as string[]
  const [selectedValues, setSelectedValues] = React.useState<string[]>(filterValue || [])

  // Handle when filter value changes externally
  React.useEffect(() => {
    setSelectedValues(filterValue || [])
  }, [filterValue])

  // Handle multi-select checkbox toggle
  const handleMultiSelectToggle = React.useCallback((value: string, checked: boolean) => {
    let newValues: string[]
    
    if (checked) {
      newValues = [...selectedValues, value]
    } else {
      newValues = selectedValues.filter(v => v !== value)
    }
    
    setSelectedValues(newValues)
    column.setFilterValue(newValues.length > 0 ? newValues : undefined)
  }, [selectedValues, column])

  return (
    <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">
          {selectedValues.length} selected
        </div>
        {selectedValues.length > 0 && (
          <button
            onClick={() => {
              setSelectedValues([])
              column.setFilterValue(undefined)
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>
      {filter.options?.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox 
            id={`filter-${column.id}-${option.value}`} 
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) => 
              handleMultiSelectToggle(option.value, checked === true)
            }
          />
          <label 
            htmlFor={`filter-${column.id}-${option.value}`}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
} 