import * as React from "react";
import { Input } from "@/components/ui/input";

interface GlobalFilterProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}

// Memoize the global filter to prevent rerendering on aggregation changes
export const GlobalFilter = React.memo(function GlobalFilter({
  globalFilter,
  setGlobalFilter,
}: GlobalFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Filter all columns..."
        value={globalFilter ?? ""}
        onChange={(event) => setGlobalFilter(event.target.value)}
        className="w-64"
      />
    </div>
  );
});
