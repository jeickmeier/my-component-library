import * as React from "react";
import { VisibilityState } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Export the props interface so it can be imported elsewhere if needed
export interface ColumnVisibilityPanelProps {
  columns: { id: string; label: unknown }[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (updater: React.SetStateAction<VisibilityState>) => void;
}

// Type for React component function with optional displayName
interface ComponentWithDisplayName {
  name?: string;
  displayName?: string;
}

// Helper function to safely get a clean column display name
function getColumnDisplayName(label: unknown): string {
  if (label === null || label === undefined) return "Unknown Column";
  
  // If it's a string, return it directly
  if (typeof label === "string") return label;
  
  // If it's a function, try to call it and see if result is usable
  if (typeof label === "function") {
    try {
      const result = label();
      if (typeof result === "string") return result;
      // Fall through to default handling for complex results
    } catch {
      // Ignore errors from calling the function
    }
  }
  
  // If it's a React element, try to extract text
  if (React.isValidElement(label)) {
    try {
      // Try to extract text content from props if they exist
      const props = label.props as Record<string, unknown> | null;
      if (props && typeof props.children === "string") {
        return props.children;
      }
      
      // Try component name with type safety
      if (typeof label.type === "function") {
        const compFn = label.type as unknown as ComponentWithDisplayName;
        // Function components might have names or displayNames
        const name = compFn.name || compFn.displayName;
        if (typeof name === "string") return name;
      } else if (typeof label.type === "string") {
        // HTML elements have string types
        return label.type;
      }
    } catch {
      // Ignore any errors from accessing properties
    }
  }
  
  // Try toString() as a last resort
  try {
    const stringValue = String(label);
    if (stringValue && stringValue !== "[object Object]") {
      // Take only first 20 chars to avoid long function strings
      return stringValue.slice(0, 20) + (stringValue.length > 20 ? "..." : "");
    }
  } catch {
    // Ignore toString errors
  }
  
  // Default fallback
  return "Column";
}

export function ColumnVisibilityPanel({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: ColumnVisibilityPanelProps) {
  // Keep an internal mirror of the table's visibility state to ensure updates are reflected
  const [localVisibility, setLocalVisibility] = React.useState<VisibilityState>(columnVisibility);
  
  // Update local state when parent state changes
  React.useEffect(() => {
    setLocalVisibility(columnVisibility);
  }, [columnVisibility]);

  // Function to toggle a column's visibility
  const toggleColumnVisibility = React.useCallback(
    (columnId: string, isVisible: boolean) => {
      // Update local state immediately for responsive UI
      setLocalVisibility(prev => ({
        ...prev,
        [columnId]: isVisible,
      }));
      
      // Propagate change to parent component
      onColumnVisibilityChange(prev => ({
        ...prev,
        [columnId]: isVisible,
      }));
    },
    [onColumnVisibilityChange]
  );

  // Function to reset all columns to visible
  const resetVisibility = React.useCallback(() => {
    const resetState: VisibilityState = {};
    columns.forEach((column) => {
      resetState[column.id] = true;
    });
    
    // Update local state immediately for responsive UI
    setLocalVisibility(resetState);
    
    // Propagate change to parent component
    onColumnVisibilityChange(resetState);
  }, [columns, onColumnVisibilityChange]);

  // Count visible columns
  const visibleColumnsCount = React.useMemo(() => {
    return columns.filter(
      (column) => localVisibility[column.id] !== false
    ).length;
  }, [columns, localVisibility]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <div>
          <h4 className="text-sm font-medium">Visible columns</h4>
          <p className="text-sm text-muted-foreground">
            {visibleColumnsCount} of {columns.length}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetVisibility}
          className="gap-1.5"
          disabled={visibleColumnsCount === columns.length}
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="sr-only md:not-sr-only md:inline-block">Show All</span>
        </Button>
      </div>

      <ScrollArea className="h-[320px] pr-4">
        <div className="space-y-1">
          {columns.map((column) => {
            // Use local state for immediate UI updates
            const isVisible = localVisibility[column.id] !== false;
            // Get a clean display name
            const displayName = getColumnDisplayName(column.label);
            
            return (
              <div 
                key={column.id} 
                className={cn(
                  "flex items-center py-2 px-3 rounded-md transition-colors cursor-pointer",
                  isVisible 
                    ? "bg-accent/50 text-accent-foreground" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => toggleColumnVisibility(column.id, !isVisible)}
              >
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border border-primary">
                    {isVisible && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <Label
                    htmlFor={`visibility-${column.id}`}
                    className="text-sm font-medium cursor-pointer select-none truncate"
                  >
                    {displayName}
                  </Label>
                </div>
                <Checkbox
                  id={`visibility-${column.id}`}
                  checked={isVisible}
                  onCheckedChange={(checked) =>
                    toggleColumnVisibility(column.id, !!checked)
                  }
                  className="sr-only"
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="pt-2 text-xs text-muted-foreground border-t">
        <p>Click on items to toggle column visibility</p>
      </div>
    </div>
  );
} 