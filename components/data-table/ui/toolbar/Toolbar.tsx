/**
 * Main toolbar component that provides access to all table customization features.
 * Combines global search, column visibility, ordering, and grouping controls
 * in a unified interface with responsive design and keyboard accessibility.
 */

import * as React from "react";
import { Table as ReactTable } from "@tanstack/react-table";
import { ColumnFilter } from "@/components/data-table/types";
import { GlobalFilter } from "@/components/data-table/ui/toolbar/GlobalFilter";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown } from "lucide-react";
import {
  tableToCSV,
  downloadCSV,
} from "@/components/data-table/utils/exportUtils";
import { TableCustomizationControl } from "@/components/data-table/ui/toolbar/TableCustomizationControl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define props for DataTableToolbar
interface DataTableToolbarProps<TData> {
  table: ReactTable<TData>;
  columnFilters?: ColumnFilter[];
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  groupableColumnObjects?: { id: string; label: string }[];
  isCustomizationDialogOpen?: boolean;
  setIsCustomizationDialogOpen?: (open: boolean) => void;
  enableCustomization?: boolean;
}

// Memoized toolbar component that handles filtering, grouping, and other table customizations
export const DataTableToolbar = React.memo(function DataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  groupableColumnObjects = [],
  isCustomizationDialogOpen = false,
  setIsCustomizationDialogOpen,
  enableCustomization = false,
}: DataTableToolbarProps<TData>) {
  // Function to handle CSV export
  const handleExportCSV = React.useCallback(() => {
    const csvData = tableToCSV(table);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCSV(csvData, `table-export-${timestamp}.csv`);
  }, [table]);

  return (
    <div className="flex items-center justify-between">
      {/* Filters Section */}
      <div className="flex-grow">
        <GlobalFilter
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>

      <div className="flex items-center">
        {/* Table Customization Controls */}
        <div className="flex items-center pl-2">
          {enableCustomization && setIsCustomizationDialogOpen && (
            <TableCustomizationControl
              table={table}
              groupableColumnObjects={groupableColumnObjects}
              isDialogOpen={isCustomizationDialogOpen}
              setIsDialogOpen={setIsCustomizationDialogOpen}
            />
          )}
        </div>

        {/* Export Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2">
              <Download className="mr-2 h-4 w-4" />
              Export
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>CSV</DropdownMenuItem>
            {/* Additional export options can be added here in the future */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});
