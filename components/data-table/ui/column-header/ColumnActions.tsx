import * as React from "react";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, EyeOff } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ColumnFilter } from "./filters/ColumnFilter";
import { AggregationMenu } from "./AggregationMenu";
import { SelectColumnFilter, RangeColumnFilter } from "../../types";

interface ColumnActionsProps<TData, TValue> {
  column: Column<TData, TValue>;
  filterConfig?: SelectColumnFilter | RangeColumnFilter;
  onAggregationChange?: (columnId: string, aggregationFn: string) => void;
}

export function ColumnActions<TData, TValue>({
  column,
  filterConfig,
  onAggregationChange,
}: ColumnActionsProps<TData, TValue>) {
  const isFilterable = column.getCanFilter();

  return (
    <>
      <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
        <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Asc
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
        <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Desc
      </DropdownMenuItem>
      {isFilterable && (
        <>
          <DropdownMenuSeparator />
          <ColumnFilter column={column} filterConfig={filterConfig} />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator />
      <AggregationMenu
        column={column}
        onAggregationChange={onAggregationChange}
      />
    </>
  );
}
