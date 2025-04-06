"use client";

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

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnFilter } from "../types";
import { FilterFactory } from "../filters/filter-factory";
import { Badge } from "@/components/ui/badge";
import { useDataTable } from "../core/context";
import { getGlobalAggregationFunctionRegistry, createAggregationFunctionRegistry } from "../aggregation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: React.ReactNode;
  className?: string;
  filter?: ColumnFilter;
  alignment?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  filter,
  alignment,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { schema, setColumnAggregation, columnAggregations } = useDataTable<TData>();
  const [isAddingAggregation, setIsAddingAggregation] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  // Make sure the registry is initialized correctly with standard functions
  React.useEffect(() => {
    // Ensure registry is populated on component mount
    createAggregationFunctionRegistry();
  }, []);
  
  // Get aggregation registry
  const aggregationRegistry = React.useMemo(() => 
    getGlobalAggregationFunctionRegistry(), []);
  
  // Get available aggregation types
  const aggregationTypes = React.useMemo(() => 
    aggregationRegistry.getTypes(), [aggregationRegistry]);
  
  // Get current aggregation type from context state
  const currentAggregationType = React.useMemo(() => {
    const columnId = column.id;
    if (!columnId) return undefined;
    
    // First check columnAggregations state
    if (columnAggregations[columnId] !== undefined) {
      return columnAggregations[columnId];
    }
    
    // Fall back to schema default if exists
    const schemaColumn = schema.columns.find(col => 
      (col.id === columnId) || (col.accessorKey === columnId)
    );
    return schemaColumn?.aggregationType;
  }, [column.id, columnAggregations, schema.columns]);

  // Check if there's an active filter
  const hasActiveFilter = column.getFilterValue() !== undefined;
  
  // Check if column has aggregation function
  const hasAggregation = !!currentAggregationType;

  // Format aggregation type name for display
  const formatAggregationType = (type: string): string => {
    if (!type) return '';
    // Get from registry if possible for a more user-friendly name
    const config = aggregationRegistry.getConfig(type);
    if (config?.label) return config.label;
    
    // Otherwise format from camelCase
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };
  
  // Handle change of aggregation type
  const handleAggregationChange = (type: string) => {
    if (setColumnAggregation && column.id) {
      setColumnAggregation(column.id, type);
      setIsAddingAggregation(false);
      
      // Show success message briefly
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    }
  };
  
  // Handle remove aggregation
  const handleRemoveAggregation = () => {
    if (setColumnAggregation && column.id) {
      setColumnAggregation(column.id, undefined);
      setShowSuccess(false);
    }
  };

  if (!column.getCanSort() && !column.getCanHide() && !filter && !hasAggregation && !schema.enableGrouping) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground w-full",
          className,
        )}
      >
        <div className="flex w-full items-center justify-between">
          <span className={cn("truncate", alignment)}>{title}</span>
          <span className="flex items-center ml-1">
            {column.getCanSort() &&
              (column.getIsSorted() === "desc" ? (
                <ChevronDown />
              ) : column.getIsSorted() === "asc" ? (
                <ChevronUp />
              ) : (
                <ChevronsUpDown />
              ))}
            {hasActiveFilter && (
              <Filter className="h-3 w-3 text-primary" />
            )}
            {hasAggregation && (
              <Calculator className="h-3 w-3 text-indigo-500 ml-1" />
            )}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {column.getCanSort() && (
          <>
            <DropdownMenuCheckboxItem
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={column.getIsSorted() === "asc"}
              onClick={() => column.toggleSorting(false)}
            >
              <ChevronUp />
              Asc
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={column.getIsSorted() === "desc"}
              onClick={() => column.toggleSorting(true)}
            >
              <ChevronDown />
              Desc
            </DropdownMenuCheckboxItem>
            {column.getIsSorted() && (
              <DropdownMenuItem
                className="pl-2 [&_svg]:text-muted-foreground"
                onClick={() => column.clearSorting()}
              >
                <X />
                Reset Sort
              </DropdownMenuItem>
            )}
          </>
        )}
        
        {/* Aggregation Information and Management */}
        {schema.enableGrouping && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="text-xs font-medium mb-1 flex items-center justify-between">
                <span className="flex items-center">
                  <Calculator className="h-3 w-3 mr-1 text-indigo-500" />
                  Aggregation
                </span>
                {!isAddingAggregation && !hasAggregation && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-5 text-xs flex items-center gap-1"
                    onClick={() => setIsAddingAggregation(true)}
                  >
                    <PlusCircle className="h-3 w-3" />
                    Add
                  </Button>
                )}
              </div>
              
              {isAddingAggregation ? (
                <div className="mt-1">
                  <Select onValueChange={handleAggregationChange}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Select aggregation function" />
                    </SelectTrigger>
                    <SelectContent>
                      {aggregationTypes.length > 0 ? (
                        aggregationTypes.map(type => {
                          const config = aggregationRegistry.getConfig(type);
                          return (
                            <SelectItem key={type} value={type} className="text-xs">
                              <div className="flex flex-col">
                                <span>{config?.label || formatAggregationType(type)}</span>
                                {config?.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {config.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="count" className="text-xs">
                          Count (Default)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 text-xs w-full"
                    onClick={() => setIsAddingAggregation(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : hasAggregation ? (
                <>
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "justify-center flex-1 transition-colors",
                        showSuccess && "bg-green-100 text-green-800 border-green-300"
                      )}
                    >
                      {showSuccess && (
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                      )}
                      {formatAggregationType(String(currentAggregationType))}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1 ml-1"
                      onClick={handleRemoveAggregation}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    This column will be aggregated when grouping data
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-1 h-6 text-xs w-full"
                    onClick={() => setIsAddingAggregation(true)}
                  >
                    Change
                  </Button>
                </>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No aggregation function set for this column
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Filter Section */}
        {(filter && column.getCanFilter()) && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div className="text-xs font-medium mb-1">Filter</div>
              <FilterFactory 
                column={column} 
                filter={filter} 
                showClearButton={true}
              />
            </div>
          </>
        )}
        
        {column.getCanHide() && (
          <>
            {(column.getCanSort() || (filter && column.getCanFilter()) || hasAggregation || schema.enableGrouping) && <DropdownMenuSeparator />}
            <DropdownMenuCheckboxItem
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={!column.getIsVisible()}
              onClick={() => column.toggleVisibility(false)}
            >
              <EyeOff />
              Hide
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 