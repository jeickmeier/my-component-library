/**
 * Column header component that displays column titles and provides access to
 * column-specific actions like sorting, filtering, and grouping. Integrates
 * with the column actions menu for advanced column operations.
 */

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ColumnFilter } from "@/components/data-table/types";
import { ColumnActions } from "@/components/data-table/ui/column-header/ColumnActions";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: React.ReactNode;
  filterConfig?: ColumnFilter;
  onAggregationChange?: (columnId: string, aggregationFn: string) => void;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  filterConfig,
  onAggregationChange,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const isSortable = column.getCanSort();

  if (!isSortable) {
    return (
      <div className="h-full flex items-center px-2 p-0 m-0 cursor-default">
        <div className="flex-1 truncate">{title}</div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-full p-0 m-0 font-normal rounded-none flex items-center justify-between data-[state=open]:bg-accent hover:bg-accent/50"
        >
          <div className="flex items-center w-full h-full px-2">
            <div className="flex-1 truncate text-left">{title}</div>
            <div className="ml-1.5 flex items-center justify-center gap-0.5">
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5 text-primary" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5 text-primary" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/70" />
              )}
              {column.getIsFiltered() && (
                <Filter className="h-3.5 w-3.5 ml-0.5 text-primary" />
              )}
            </div>
          </div>
          <span className="sr-only">Sort by {column.id}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="p-0">
        <ColumnActions
          column={column}
          filterConfig={filterConfig}
          onAggregationChange={onAggregationChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
