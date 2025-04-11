import * as React from "react"
import { Table as ReactTable, ColumnDef, flexRender, Row, GroupingState } from "@tanstack/react-table"
import { ClientTableBody } from "./ClientBody"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTableColumnHeader } from "../ui/ColumnHeader"
import { ColumnFilter } from "../types"

// Define props for DataTableStructure
interface DataTableStructureProps<TData, TValue> {
  table: ReactTable<TData>
  columns: ColumnDef<TData, TValue>[]
  isClient: boolean
  rows: Row<TData>[],
  tableContainerRef: React.RefObject<HTMLDivElement | null>
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>
  isMountedRef: React.RefObject<boolean>
  grouping: GroupingState
  headerRef: React.RefObject<HTMLTableSectionElement | null>
  columnFilters?: ColumnFilter[]
}

// Memoized table header component to prevent re-renders
const MemoizedTableHeader = React.memo(
  function TableHeaderComponent<TData>({
    table,
    headerRef,
    getFilterConfigForColumn,
    onAggregationChange
  }: {
    table: ReactTable<TData>,
    headerRef: React.RefObject<HTMLTableSectionElement | null>,
    getFilterConfigForColumn: (columnId: string) => ColumnFilter | undefined,
    onAggregationChange: (columnId: string, aggregationFn: string) => void
  }) {
    return (
      <Table 
        style={{ 
          width: '100%', 
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          borderSpacing: 0
        }}
      >
        <TableHeader
          ref={headerRef}
          className="sticky-table-header"
          style={{
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow 
              key={headerGroup.id}
              style={{ 
                display: 'flex', 
                width: '100%',
              }}
            >
              {headerGroup.headers.map((header) => (
                <TableHead 
                  key={header.id}
                  style={{
                    flex: header.column.getSize() ? `${header.column.getSize()} 0 0` : 1,
                    width: header.column.getSize() ? `${header.column.getSize()}px` : 'auto',
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <DataTableColumnHeader 
                      column={header.column} 
                      title={flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      filterConfig={getFilterConfigForColumn(header.column.id)}
                      onAggregationChange={onAggregationChange}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
      </Table>
    );
  }
) as <T>(props: {
  table: ReactTable<T>,
  headerRef: React.RefObject<HTMLTableSectionElement | null>,
  getFilterConfigForColumn: (columnId: string) => ColumnFilter | undefined,
  onAggregationChange: (columnId: string, aggregationFn: string) => void
}) => React.ReactElement;

// New DataTableStructure component
export function DataTableStructure<TData, TValue>({
  table,
  columns,
  isClient,
  rows,
  tableContainerRef,
  rowRefsMap,
  isMountedRef,
  grouping,
  headerRef,
  columnFilters = [],
}: DataTableStructureProps<TData, TValue>) {
  // Separate state for body updates only
  const [bodyUpdateCounter, setBodyUpdateCounter] = React.useState(0);
  
  // Helper function to find filter config for a column
  const getFilterConfigForColumn = React.useCallback((columnId: string) => {
    return columnFilters.find(filter => filter.column === columnId);
  }, [columnFilters]);
  
  // Handle aggregation function change
  const handleAggregationChange = React.useCallback((columnId: string, aggregationFn: string) => {
    console.log(`Changing aggregation for column ${columnId} to ${aggregationFn}`);
    
    // Update the body counter, not causing header re-render
    setBodyUpdateCounter(prev => prev + 1);
    
    // Apply the aggregation change directly to the column definition
    // This is needed in addition to what AggregationMenu does
    const columnDef = table.getAllColumns().find(col => col.id === columnId)?.columnDef;
    if (columnDef) {
      // @ts-expect-error - Type system constraints
      columnDef.aggregationFn = aggregationFn;
    }
    
    // Force a table state update to recalculate
    table.setColumnOrder([...table.getState().columnOrder]);
    
    // Schedule a delayed reset to ensure the column def is updated first
    setTimeout(() => {
      // Force table recalculation in different ways
      if (grouping.length > 0) {
        // Temporarily toggle grouping to force recalculation
        const tempGrouping = [...grouping];
        table.setGrouping([]);
        
        // Restore grouping without triggering header rerenders
        setTimeout(() => {
          table.setGrouping(tempGrouping);
          
          // Force expanded state reset to ensure grouped data is recalculated
          setTimeout(() => {
            table.resetExpanded(true);
          }, 50);
        }, 50);
      } else {
        // Even without grouping, force a table update
        table.resetExpanded(true);
      }
    }, 50);
  }, [table, grouping]);

  // Effect to update rows only when bodyUpdateCounter changes
  React.useEffect(() => {
    if (bodyUpdateCounter > 0) {
      // Only reset expansion state which affects rows, not headers
      table.resetExpanded();
    }
  }, [bodyUpdateCounter, table]);

  return (
    <div className="rounded-md border">
      {/* Memoized table header that won't re-render when bodyUpdateCounter changes */}
      <MemoizedTableHeader
        table={table}
        headerRef={headerRef}
        getFilterConfigForColumn={getFilterConfigForColumn}
        onAggregationChange={handleAggregationChange}
      />
      
      {/* Scrollable table body that will re-render when needed */}
      <div 
        ref={tableContainerRef} 
        className="virtualized-table-container" 
        style={{ 
          height: '400px',
          position: 'relative',
          willChange: 'transform',
          overflowX: 'auto',
          overflowY: 'auto'
        }}
        key={`body-container-${bodyUpdateCounter}`} // Force only this part to update
      >
        <Table 
          style={{ 
            width: '100%', 
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: 0
          }}
        >
          {isClient ? (
            <ClientTableBody<TData, TValue>
              rows={rows}
              tableContainerRef={tableContainerRef as React.RefObject<HTMLDivElement>}
              rowRefsMap={rowRefsMap}
              isMountedRef={isMountedRef}
              grouping={grouping}
              columns={columns}
              bodyUpdateCounter={bodyUpdateCounter}
            />
          ) : (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading table data...
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  )
} 