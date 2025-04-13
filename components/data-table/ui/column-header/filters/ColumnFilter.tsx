/**
 * Base column filter component that manages the filter popover UI and state.
 * Provides the foundation for all specific filter types while handling common
 * functionality like popover positioning and filter application.
 */

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
  ColumnFilter as ColumnFilterType,
} from "@/components/data-table/types";
import { SelectFilter } from "./SelectFilter";
import { RangeFilter } from "./RangeFilter";
import { TextFilter } from "./TextFilter";
import { StarRatingFilter } from "./StarRatingFilter";
import { RangeSliderFilter } from "./RangeSliderFilter";

interface ColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  filterConfig?: ColumnFilterType;
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
      case "rangeSlider":
        return <RangeSliderFilter column={column} filter={filterConfig} />;
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
