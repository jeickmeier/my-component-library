/**
 * Star rating filter component that enables filtering based on star ratings.
 * Provides an interactive star rating interface for selecting minimum rating
 * thresholds with customizable star appearance and behavior.
 */

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRatingColumnFilter } from "@/components/data-table/types";

interface StarRatingFilterProps<TData> {
  column: Column<TData, unknown>;
  filter: StarRatingColumnFilter;
}

export function StarRatingFilter<TData>({
  column,
  filter,
}: StarRatingFilterProps<TData>) {
  const maxStars = filter.maxStars || 5;
  const currentValue = (column.getFilterValue() as number) || null;
  
  const clearFilter = React.useCallback(() => {
    column.setFilterValue(undefined);
  }, [column]);

  // Handle star rating selection
  const handleStarClick = (rating: number) => {
    // If the same value is clicked, clear the filter
    if (currentValue === rating) {
      clearFilter();
    } else {
      column.setFilterValue(rating);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center space-x-1 mb-1">
        {/* Generate buttons for each star rating */}
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleStarClick(rating)}
            className={`p-1 rounded-sm hover:bg-accent hover:text-accent-foreground ${
              currentValue && rating <= currentValue
                ? "text-yellow-500"
                : "text-gray-300"
            }`}
            aria-label={`${rating} star${rating !== 1 ? "s" : ""} or more`}
          >
            ★
          </button>
        ))}
      </div>
      <div className="text-xs mt-1 text-muted-foreground">
        {currentValue 
          ? `${currentValue} star${currentValue !== 1 ? "s" : ""} or more` 
          : "Select rating"}
      </div>
      {currentValue && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-full mt-1 text-xs p-0 opacity-70 hover:opacity-100"
          onClick={clearFilter}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
} 