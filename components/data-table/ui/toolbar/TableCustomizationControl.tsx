/**
 * Table customization control component that provides a unified interface for
 * managing table features like column visibility, ordering, and grouping.
 * Implements a popover menu with tabs for different customization options.
 */
import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Layers, Eye, Move } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GroupingPanel } from "./ColumnGroupingPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnVisibilityPanel } from "./ColumnVisibilityPanel";
import { ColumnOrderingPanel } from "./ColumnOrderingPanel";

// Simple memoized button component
const CustomizationButton = React.memo(function CustomizationButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={onClick}
      type="button"
    >
      <Layers className="h-4 w-4" />
      Customize
    </Button>
  );
});

// Define props for TableCustomizationControl
interface TableCustomizationControlProps<T> {
  table: Table<T>;
  groupableColumnObjects: { id: string; label: string }[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

// Comprehensive table customization component
export function TableCustomizationControl<T>({
  table,
  groupableColumnObjects,
  isDialogOpen,
  setIsDialogOpen,
}: TableCustomizationControlProps<T>) {
  const [activeTab, setActiveTab] = React.useState("grouping");

  // Extract state management from the table instance
  const grouping = table.getState().grouping;
  const setGrouping = table.setGrouping;

  const columnOrder = table.getState().columnOrder;
  const setColumnOrder = table.setColumnOrder;

  const columnVisibility = table.getState().columnVisibility;
  const setColumnVisibility = table.setColumnVisibility;

  // All non-grouped columns for ordering panel
  const orderableColumns = React.useMemo(() => {
    return table
      .getAllLeafColumns()
      .filter((column) => !grouping.includes(column.id))
      .map((column) => ({
        id: column.id,
        label: column.columnDef.header?.toString() || column.id,
      }));
  }, [table, grouping]);

  // All columns for visibility panel
  const allColumns = React.useMemo(() => {
    return table.getAllLeafColumns().map((column) => ({
      id: column.id,
      label: column.columnDef.header?.toString() || column.id,
    }));
  }, [table]);

  // Handle the button click to open the dialog
  const handleOpenDialog = React.useCallback(() => {
    setIsDialogOpen(true);
  }, [setIsDialogOpen]);

  return (
    <>
      <CustomizationButton onClick={handleOpenDialog} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Column Customization</DialogTitle>
            <DialogDescription>
              Customize how your column data is displayed by grouping,
              reordering, or hiding.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="grouping">
                <Layers className="h-4 w-4 mr-2" />
                Grouping
              </TabsTrigger>
              <TabsTrigger value="visibility">
                <Eye className="h-4 w-4 mr-2" />
                Visibility
              </TabsTrigger>
              <TabsTrigger value="ordering">
                <Move className="h-4 w-4 mr-2" />
                Ordering
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grouping">
              <GroupingPanel
                availableColumns={groupableColumnObjects}
                grouping={grouping}
                onGroupingChange={setGrouping}
              />
            </TabsContent>

            <TabsContent value="visibility">
              <ColumnVisibilityPanel
                columns={allColumns}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
              />
            </TabsContent>

            <TabsContent value="ordering">
              <ColumnOrderingPanel
                columns={orderableColumns}
                columnOrder={columnOrder}
                onColumnOrderChange={setColumnOrder}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

// For backward compatibility
export const DataTableGroupingControl = TableCustomizationControl;
