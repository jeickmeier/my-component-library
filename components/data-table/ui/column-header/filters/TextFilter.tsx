/**
 * Text filter component that provides free-form text filtering capabilities.
 * Implements debounced text input with case-sensitive/insensitive options
 * and support for different text matching strategies.
 */

import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextFilterProps<TData> {
  column: Column<TData, unknown>;
  label?: string;
}

export function TextFilter<TData>({
  column,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  label = "Filter value",
}: TextFilterProps<TData>) {
  const [textValue, setTextValue] = React.useState<string>("");

  // Get current filter value for the effect dependency
  const currentFilterValue = column.getFilterValue();

  // Initialize text filter value from column
  React.useEffect(() => {
    setTextValue((currentFilterValue as string) ?? "");
  }, [currentFilterValue]);

  const clearFilter = React.useCallback(() => {
    setTextValue("");
    column.setFilterValue(undefined);
  }, [column]);

  return (
    <div className="relative w-full">
      <Input
        placeholder="Filter..."
        value={textValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setTextValue(newValue);
          column.setFilterValue(newValue || undefined);
        }}
        className="h-8 min-h-8 text-sm w-full pr-7"
      />
      {textValue && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 absolute right-1 top-1 p-0 opacity-70 hover:opacity-100"
          onClick={clearFilter}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Clear filter</span>
        </Button>
      )}
    </div>
  );
}
