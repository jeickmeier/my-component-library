"use client";

/**
 * @module data-table/parts/column-header
 * @description Interactive column header with sorting, filtering, aggregation, and visibility controls.
 */

// React + Lib Imports
import * as React from "react";
import type { Column } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  EyeOff,
  X,
  Filter,
  Calculator,
  PlusCircle,
  CheckCircle,
} from "lucide-react";

// Internal Imports
import { useDataTable } from "../core/context";
import { getGlobalAggregationFunctionRegistry, createAggregationFunctionRegistry } from "../aggregation";
import { FilterFactory } from "../filters/filter-factory";
import { cn } from "@/lib/utils";
import { formatAggregationType } from "../utils"; // Use extracted utility
import type { DataTableColumnDef, ColumnFilter } from "../types";

// UI Imports
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// --- Sub Components for Composition ---

interface ColumnHeaderTriggerProps<TData> {
  column: Column<TData, unknown>;
  title: React.ReactNode;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  hasAggregation: boolean;
}

/** Renders the trigger element for the column header dropdown */
const ColumnHeaderTrigger = React.memo(
  <TData,>({ column, title, alignment, className, hasAggregation }: ColumnHeaderTriggerProps<TData>) => {
    const hasActiveFilter = column.getFilterValue() !== undefined;
    const canSort = column.getCanSort();

    // Consistent styling for trigger and icons
    const triggerClass = cn(
      "flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent w-full",
      className
    );
    const iconClass = "h-4 w-4 shrink-0 text-muted-foreground";
    const activeIconClass = "h-3.5 w-3.5";

    return (
      <DropdownMenuTrigger className={triggerClass}>
        <div className="flex w-full items-center justify-between">
          {/* Title with alignment */}
          <span className={cn("truncate", alignment ? `text-${alignment}` : 'text-left')}>{title}</span>

          {/* Status Icons */}
          <span className="flex items-center ml-1 gap-0.5">
            {canSort && column.getIsSorted() && (
              column.getIsSorted() === "desc" ? (
                <ChevronDown className={activeIconClass} />
              ) : (
                <ChevronUp className={activeIconClass} />
              )
            )}
            {hasActiveFilter && (
              <Filter className={cn(activeIconClass, "text-primary")} />
            )}
            {/* Show indicator for aggregation when applicable */}
            {hasAggregation && (
              <Calculator className={cn(activeIconClass, "text-indigo-500 opacity-75")} />
            )}
            {/* Show default sort icon only if sortable and not currently sorted */}
            {canSort && !column.getIsSorted() && (
              <ChevronsUpDown className={cn(iconClass, "opacity-50")} />
            )}
          </span>
        </div>
      </DropdownMenuTrigger>
    );
  },
  // Compare props to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Basic props comparison
    const titleEqual = prevProps.title === nextProps.title;
    const alignmentEqual = prevProps.alignment === nextProps.alignment;
    const classNameEqual = prevProps.className === nextProps.className;
    
    // Column state comparison
    const prevSorted = prevProps.column.getIsSorted();
    const nextSorted = nextProps.column.getIsSorted();
    const sortEqual = prevSorted === nextSorted;
    
    const prevFilter = prevProps.column.getFilterValue();
    const nextFilter = nextProps.column.getFilterValue();
    const filterEqual = prevFilter === nextFilter;
    
    const aggregationEqual = prevProps.hasAggregation === nextProps.hasAggregation;
    
    // Skip re-render if all important states are equal
    return titleEqual && alignmentEqual && classNameEqual && sortEqual && filterEqual && aggregationEqual;
  }
);

// Add display name
ColumnHeaderTrigger.displayName = "ColumnHeaderTrigger";

interface SortMenuItemsProps<TData> {
  column: Column<TData, unknown>;
}

/** Renders the sort-related menu items */
const SortMenuItems = React.memo(
  <TData,>({ column }: SortMenuItemsProps<TData>) => {
    const iconClass = "h-4 w-4 shrink-0 text-muted-foreground";
    const handleSortAsc = React.useCallback(() => column.toggleSorting(false), [column]);
    const handleSortDesc = React.useCallback(() => column.toggleSorting(true), [column]);
    const handleResetSort = React.useCallback(() => column.clearSorting(), [column]);

    return (
      <>
        <DropdownMenuCheckboxItem
          className="relative pr-8 pl-2 text-xs [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
          checked={column.getIsSorted() === "asc"}
          onSelect={handleSortAsc}
        >
          <ChevronUp className={iconClass} />
          Asc
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="relative pr-8 pl-2 text-xs [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
          checked={column.getIsSorted() === "desc"}
          onSelect={handleSortDesc}
        >
          <ChevronDown className={iconClass} />
          Desc
        </DropdownMenuCheckboxItem>
        {column.getIsSorted() && (
          <DropdownMenuItem
            className="pl-2 text-xs"
            onSelect={handleResetSort}
          >
            <X className={iconClass} />
            Reset Sort
          </DropdownMenuItem>
        )}
      </>
    );
  },
  // Compare props to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only compare the sorting state
    const prevSorted = prevProps.column.getIsSorted();
    const nextSorted = nextProps.column.getIsSorted();
    return prevSorted === nextSorted;
  }
);

// Add display name
SortMenuItems.displayName = "SortMenuItems";

interface AggregationSectionProps<TData> {
  column: Column<TData, unknown>;
}

/** Renders the aggregation section in the dropdown menu */
const AggregationSection = React.memo(
  <TData,>({ column }: AggregationSectionProps<TData>) => {
    const { setColumnAggregation, columnAggregations } = useDataTable<TData>();
    const columnDef = column.columnDef as DataTableColumnDef<TData>;
    const [isAddingAggregation, setIsAddingAggregation] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);

    // Initialize registry (consider moving to context/provider if used globally)
    React.useEffect(() => {
      createAggregationFunctionRegistry();
    }, []);

    const aggregationRegistry = React.useMemo(() => getGlobalAggregationFunctionRegistry(), []);
    const aggregationTypes = React.useMemo(() => aggregationRegistry?.getTypes() ?? [], [aggregationRegistry]);

    const currentAggregationType = React.useMemo(() => {
      const columnId = column.id;
      return columnAggregations?.[columnId] ?? columnDef.aggregationType;
    }, [column.id, columnAggregations, columnDef.aggregationType]);

    const hasAggregation = !!currentAggregationType;

    const handleAggregationChange = React.useCallback((type: string) => {
      if (setColumnAggregation && column.id) {
        setColumnAggregation(column.id, type || undefined);
        setIsAddingAggregation(false);
        if (type) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 1500);
        }
      }
    }, [setColumnAggregation, column.id]);

    const handleRemoveAggregation = React.useCallback(() => {
      if (setColumnAggregation && column.id) {
        setColumnAggregation(column.id, undefined);
        setShowSuccess(false);
        setIsAddingAggregation(false);
      }
    }, [setColumnAggregation, column.id]);

    return (
      <div className="px-2 py-1.5">
        {/* Header and Add button */}
        <div className="text-xs font-medium mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calculator className="h-3.5 w-3.5 text-indigo-500" />
            Aggregation
          </span>
          {!isAddingAggregation && !hasAggregation && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs flex items-center gap-1"
              onClick={() => setIsAddingAggregation(true)}
            >
              <PlusCircle className="h-3 w-3" />
              Add
            </Button>
          )}
        </div>

        {/* Aggregation Controls: Select or Status Badge */}
        {isAddingAggregation ? (
          <div className="mt-1 space-y-1">
            <Select value={currentAggregationType || ""} onValueChange={handleAggregationChange}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select function..." />
              </SelectTrigger>
              <SelectContent>
                {aggregationTypes.length > 0 ? (
                  aggregationTypes.map(type => {
                    const config = aggregationRegistry?.getConfig(type);
                    return (
                      <SelectItem key={type} value={type} className="text-xs">
                        {config?.label || formatAggregationType(type, aggregationRegistry)}
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value="count" disabled className="text-xs text-muted-foreground">
                    No functions available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs w-full"
              onClick={() => setIsAddingAggregation(false)}
            >
              Cancel
            </Button>
          </div>
        ) : hasAggregation ? (
          <div className="mt-1 space-y-1">
            <div className="flex justify-between items-center gap-1">
              <Badge
                variant="outline"
                className={cn(
                  "justify-center flex-1 transition-colors h-7 text-xs",
                  showSuccess && "bg-green-100 text-green-800 border-green-300"
                )}
              >
                {showSuccess && <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-600" />}
                {formatAggregationType(String(currentAggregationType), aggregationRegistry)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRemoveAggregation}
                aria-label="Remove aggregation"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs w-full"
              onClick={() => setIsAddingAggregation(true)}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground mt-1">
            No aggregation set.
          </div>
        )}
      </div>
    );
  }
);

// Add display name
AggregationSection.displayName = "AggregationSection";

interface FilterSectionProps<TData> {
  column: Column<TData, unknown>;
  filterConfig: ColumnFilter;
}

/** Renders the filter section in the dropdown menu */
const FilterSection = React.memo(
  <TData,>({ column, filterConfig }: FilterSectionProps<TData>) => {
    return (
      <div className="px-2 py-1.5">
        <div className="text-xs font-medium mb-1 flex items-center gap-1">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filter</span>
        </div>
        {/* Pass column and filter config to the factory */}
        <FilterFactory
          column={column}
          filter={filterConfig}
          showClearButton={true}
        />
      </div>
    );
  }
);

// Add display name
FilterSection.displayName = "FilterSection";

interface VisibilityToggleItemProps<TData> {
  column: Column<TData, unknown>;
}

/** Renders the hide column menu item */
const VisibilityToggleItem = React.memo(
  <TData,>({ column }: VisibilityToggleItemProps<TData>) => {
    const iconClass = "h-4 w-4 shrink-0 text-muted-foreground";
    const handleToggleVisibility = React.useCallback(() => column.toggleVisibility(false), [column]);

    return (
      <DropdownMenuCheckboxItem
        className="relative pr-8 pl-2 text-xs [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
        checked={!column.getIsVisible()}
        onSelect={handleToggleVisibility}
      >
        <EyeOff className={iconClass} />
        Hide Column
      </DropdownMenuCheckboxItem>
    );
  },
  // Compare props to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only compare the visibility state
    const prevVisible = prevProps.column.getIsVisible();
    const nextVisible = nextProps.column.getIsVisible();
    return prevVisible === nextVisible;
  }
);

// Add display name
VisibilityToggleItem.displayName = "VisibilityToggleItem";

interface ColumnHeaderMenuContentProps<TData> {
  column: Column<TData, unknown>;
}

/** Renders the content of the column header dropdown menu */
const ColumnHeaderMenuContent = React.memo(
  <TData,>({ column }: ColumnHeaderMenuContentProps<TData>) => {
    const { schema } = useDataTable<TData>();
    const columnDef = column.columnDef as DataTableColumnDef<TData>;
    const filterConfig = columnDef.filter;
    const canSort = column.getCanSort();
    const canHide = column.getCanHide();
    const canFilter = column.getCanFilter() && !!filterConfig;
    const showAggregationControls = schema.enableGrouping; // Aggregation linked to grouping

    // Cast column to unknown type to avoid TypeScript errors
    const unknownColumn = column as unknown as Column<unknown, unknown>;

    return (
      <DropdownMenuContent align="start" className="w-64">
        {/* Sorting Section */}
        {canSort && <SortMenuItems column={unknownColumn} />}

        {/* Aggregation Section */}
        {showAggregationControls && (
          <>
            {(canSort) && <DropdownMenuSeparator />}
            <AggregationSection column={unknownColumn} />
          </>
        )}

        {/* Filter Section */}
        {canFilter && (
          <>
            {(canSort || showAggregationControls) && <DropdownMenuSeparator />}
            <FilterSection column={unknownColumn} filterConfig={filterConfig!} />
          </>
        )}

        {/* Visibility Section */}
        {canHide && (
          <>
            {(canSort || canFilter || showAggregationControls) && <DropdownMenuSeparator />}
            <VisibilityToggleItem column={unknownColumn} />
          </>
        )}
      </DropdownMenuContent>
    );
  }
);

// Add display name
ColumnHeaderMenuContent.displayName = "ColumnHeaderMenuContent";

// --- Main Component ---

// Props Interface (simplified)
interface DataTableColumnHeaderProps<TData> {
  column: Column<TData, unknown>;
  title: React.ReactNode;
  className?: string;
}

/**
 * Renders an interactive column header.
 * Provides a dropdown menu for sorting, filtering (if configured),
 * aggregation (if enabled), and hiding the column.
 */
export const DataTableColumnHeader = React.memo(
  function DataTableColumnHeaderInner<TData>({
    column,
    title,
    className,
  }: DataTableColumnHeaderProps<TData>) {
    // --- State & Hooks ---
    const columnDef = column.columnDef as DataTableColumnDef<TData>;
    const alignment = columnDef.alignment;
    const { schema, columnAggregations } = useDataTable<TData>();

    // --- Render Logic ---
    // Render simple header if no interactive features are enabled
    const canSort = column.getCanSort();
    const canHide = column.getCanHide();
    const canFilter = column.getCanFilter() && !!columnDef.filter;
    const showAggregationControls = schema.enableGrouping;

    // Calculate hasAggregation here using the state from the unconditional hook call
    const hasAggregation = !!(columnDef.aggregationType || columnAggregations?.[column.id]);

    // Cast column to unknown type to avoid TypeScript errors
    const unknownColumn = column as unknown as Column<unknown, unknown>;

    if (!canSort && !canHide && !canFilter && !showAggregationControls) {
      return (
        <div className={cn("p-2", className, alignment ? `text-${alignment}` : 'text-left')}>
          {title}
        </div>
      );
    }

    return (
      <DropdownMenu modal={false}> {/* Prevent focus trap issues with filters inside */}
        <ColumnHeaderTrigger 
          column={unknownColumn} 
          title={title} 
          alignment={alignment} 
          className={className} 
          hasAggregation={hasAggregation}
        />
        <ColumnHeaderMenuContent column={unknownColumn} />
      </DropdownMenu>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    // Compare basic props
    const titleEqual = prevProps.title === nextProps.title;
    const classNameEqual = prevProps.className === nextProps.className;
    
    // Compare column state
    const prevColumn = prevProps.column;
    const nextColumn = nextProps.column;
    
    const prevSortingState = prevColumn.getIsSorted();
    const nextSortingState = nextColumn.getIsSorted();
    
    const prevFilterValue = prevColumn.getFilterValue();
    const nextFilterValue = nextColumn.getFilterValue();
    
    const prevVisibility = prevColumn.getIsVisible();
    const nextVisibility = nextColumn.getIsVisible();
    
    // Skip re-render if all important states are equal
    return titleEqual && 
           classNameEqual && 
           prevSortingState === nextSortingState &&
           prevFilterValue === nextFilterValue &&
           prevVisibility === nextVisibility;
  }
);

// Add display name
DataTableColumnHeader.displayName = "DataTableColumnHeader"; 