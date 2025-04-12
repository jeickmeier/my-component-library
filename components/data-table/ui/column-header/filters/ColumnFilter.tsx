import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  SelectColumnFilter,
  RangeColumnFilter,
  StarRatingColumnFilter,
} from "@/components/data-table/types";
import { SelectFilter } from "./SelectFilter";
import { RangeFilter } from "./RangeFilter";
import { TextFilter } from "./TextFilter";
import { StarRatingFilter } from "./StarRatingFilter";

interface ColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  filterConfig?: SelectColumnFilter | RangeColumnFilter | StarRatingColumnFilter;
}

export function ColumnFilter<TData, TValue>({
  column,
  filterConfig,
}: ColumnFilterProps<TData, TValue>) {
  // Render the appropriate filter based on the filter type
  const renderFilter = () => {
    if (!filterConfig) {
      return <TextFilter column={column} />;
    }

    switch (filterConfig.type) {
      case "select":
        return <SelectFilter column={column} filter={filterConfig} />;
      case "range":
        return <RangeFilter column={column} filter={filterConfig} />;
      case "starRating":
        return <StarRatingFilter column={column} filter={filterConfig} />;
      default:
        // Default to a simple text filter
        return <TextFilter column={column} />;
    }
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
        Filter
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="p-2 min-w-[220px]">
          <div className="space-y-2">{renderFilter()}</div>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
