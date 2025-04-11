import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { SelectColumnFilter, RangeColumnFilter } from "@/components/data-table/types"
import { SelectFilter } from "./SelectFilter"
import { RangeFilter } from "./RangeFilter"

interface ColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>
  filterConfig?: SelectColumnFilter | RangeColumnFilter
}

export function ColumnFilter<TData, TValue>({
  column,
  filterConfig,
}: ColumnFilterProps<TData, TValue>) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Filter
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="p-2 min-w-[220px]">
          <div className="space-y-2">
            {filterConfig?.type === 'select' ? (
              <SelectFilter column={column} filter={filterConfig} />
            ) : filterConfig?.type === 'range' ? (
              <RangeFilter column={column} filter={filterConfig} />
            ) : (
              /* Default text filter */
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
  )
} 