import * as React from "react"
import { GroupingState } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Layers } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GroupingPanel } from "./GroupingPanel"

// Simple memoized button component
const GroupingButton = React.memo(function GroupingButton({ 
  onClick 
}: { 
  onClick: () => void 
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
      Group By
    </Button>
  );
});

// Define props for DataTableGroupingControl
interface DataTableGroupingControlProps {
  grouping: GroupingState
  setGrouping: (updater: React.SetStateAction<GroupingState>) => void
  groupableColumnObjects: { id: string; label: string }[]
  isGroupingDialogOpen: boolean
  setIsGroupingDialogOpen: (open: boolean) => void
}

// Simplified DataTableGroupingControl component
export const DataTableGroupingControl = React.memo(function DataTableGroupingControl({
  grouping,
  setGrouping,
  groupableColumnObjects,
  isGroupingDialogOpen,
  setIsGroupingDialogOpen,
}: DataTableGroupingControlProps) {
  // Handle the button click to open the dialog
  const handleOpenDialog = React.useCallback(() => {
    setIsGroupingDialogOpen(true);
  }, [setIsGroupingDialogOpen]);

  return (
    <>
      <GroupingButton onClick={handleOpenDialog} />
      
      <Dialog open={isGroupingDialogOpen} onOpenChange={setIsGroupingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Table Grouping</DialogTitle>
            <DialogDescription>
              Group your data by one or more columns to create hierarchical views. Drag to reorder groups.
            </DialogDescription>
          </DialogHeader>
          <GroupingPanel
            availableColumns={groupableColumnObjects}
            grouping={grouping}
            onGroupingChange={setGrouping}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}); 