import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

interface TextFilterProps<TData> {
  column: Column<TData, unknown>;
  label?: string;
}

export function TextFilter<TData>({
  column,
  label = "Filter value",
}: TextFilterProps<TData>) {
  const [textValue, setTextValue] = React.useState<string>("");

  // Get current filter value for the effect dependency
  const currentFilterValue = column.getFilterValue();

  // Initialize text filter value from column
  React.useEffect(() => {
    setTextValue((currentFilterValue as string) ?? "");
  }, [currentFilterValue]);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-medium">{label}</div>
      <Input
        placeholder="Filter value..."
        value={textValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setTextValue(newValue);
          column.setFilterValue(newValue || undefined);
        }}
        className="h-8"
      />
    </div>
  );
}
